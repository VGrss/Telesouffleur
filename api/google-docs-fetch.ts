import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GoogleDocsContent {
  title: string;
  content: string;
  wordCount: number;
}

function isValidGoogleDocsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'docs.google.com' && 
           urlObj.pathname.includes('/document/d/');
  } catch {
    return false;
  }
}

function extractDocumentId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const docIndex = pathParts.indexOf('d');
    
    if (docIndex >= 0 && docIndex + 1 < pathParts.length) {
      return pathParts[docIndex + 1];
    }
    
    return null;
  } catch {
    return null;
  }
}

async function extractTextFromGoogleDocsHtml(html: string): Promise<GoogleDocsContent> {
  // Extract title from HTML title tag or head title
  let title = 'Google Document';
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].replace(/ - Google Docs$/, '').trim();
  }

  // The export HTML format is much cleaner and structured
  // Find the main body content
  let content = '';
  
  // Extract content from the body tag - export HTML has clean structure
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    let bodyContent = bodyMatch[1];
    
    // Remove style and script tags
    bodyContent = bodyContent
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Convert HTML elements to preserve document structure
    content = bodyContent
      // Convert headings with proper spacing
      .replace(/<h[1-6][^>]*>/gi, '')
      .replace(/<\/h[1-6][^>]*>/gi, '\n\n')
      // Convert paragraphs to double line breaks
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p[^>]*>/gi, '\n\n')
      // Convert line breaks
      .replace(/<br\s*\/?>/gi, '\n')
      // Convert divs (preserve structure but add line breaks)
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/div[^>]*>/gi, '\n')
      // Handle lists properly
      .replace(/<ol[^>]*>/gi, '\n')
      .replace(/<\/ol[^>]*>/gi, '\n')
      .replace(/<ul[^>]*>/gi, '\n')
      .replace(/<\/ul[^>]*>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li[^>]*>/gi, '\n')
      // Handle table structure
      .replace(/<table[^>]*>/gi, '\n')
      .replace(/<\/table[^>]*>/gi, '\n\n')
      .replace(/<tr[^>]*>/gi, '')
      .replace(/<\/tr[^>]*>/gi, '\n')
      .replace(/<td[^>]*>/gi, '')
      .replace(/<\/td[^>]*>/gi, ' | ')
      .replace(/<th[^>]*>/gi, '')
      .replace(/<\/th[^>]*>/gi, ' | ')
      // Remove all other HTML tags
      .replace(/<[^>]*>/g, '')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      // Clean up whitespace while preserving structure
      .replace(/[ \t]+/g, ' ') // Multiple spaces/tabs to single space
      .replace(/\n[ \t]+/g, '\n') // Remove spaces/tabs at start of lines
      .replace(/[ \t]+\n/g, '\n') // Remove spaces/tabs at end of lines
      .replace(/\n{3,}/g, '\n\n') // Maximum of 2 consecutive line breaks
      .replace(/^\n+/, '') // Remove leading newlines
      .replace(/\n+$/, '') // Remove trailing newlines
      .trim();
  }

  // Fallback: if body extraction fails, try to get any text content
  if (!content || content.length < 10) {
    // Remove all HTML tags and extract plain text
    content = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Final fallback message
  if (!content || content.length < 10) {
    content = `Unable to extract content from Google Docs export.\n\nDocument title: ${title}\n\nPlease ensure the document is publicly accessible and try again, or copy the content manually.`;
  }

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

  return {
    title,
    content,
    wordCount
  };
}

async function fetchGoogleDocsContent(url: string, res: VercelResponse) {
  try {
    // Convert the viewer URL to export HTML URL
    const docId = extractDocumentId(url);
    if (!docId) {
      return res.status(400).json({
        error: 'Invalid Google Docs URL format',
        details: 'Could not extract document ID from URL',
        url: url
      });
    }

    // Use the export HTML endpoint instead of the viewer page
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=html`;
    console.log(`Fetching Google Docs export HTML from: ${exportUrl}`);

    // Try to fetch the Google Docs export HTML
    const response = await fetch(exportUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`Failed to fetch Google Docs page: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        error: `Failed to fetch Google Docs page (${response.status} ${response.statusText})`,
        details: 'The document might be private or the URL might be incorrect',
        url: url
      });
    }

    const html = await response.text();
    console.log(`Successfully fetched Google Docs HTML, length: ${html.length}`);

    if (!html || html.length === 0) {
      console.error('Empty response from Google Docs');
      return res.status(400).json({
        error: 'Empty response from Google Docs',
        details: 'No content found in the response',
        url: url
      });
    }

    const content = await extractTextFromGoogleDocsHtml(html);

    // Check if we extracted any meaningful content
    if (!content.content || content.content.trim().length === 0) {
      console.error('No content extracted from Google Docs');
      return res.status(400).json({
        error: 'Unable to extract text content from the Google Docs page',
        details: 'The page might be empty, private, or use an unsupported format',
        url: url,
        suggestion: 'Please make sure the document is public and contains text content'
      });
    }

    console.log(`Successfully extracted content: ${content.wordCount} words`);
    return res.status(200).json(content);

  } catch (error) {
    console.error('Error fetching Google Docs content:', error);
    return res.status(500).json({
      error: 'Internal server error while fetching Google Docs content',
      details: error instanceof Error ? error.message : 'Unknown error',
      url: url
    });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate Google Docs URL format
  if (!isValidGoogleDocsUrl(url)) {
    return res.status(400).json({ 
      error: 'Invalid Google Docs URL format',
      details: 'Please provide a valid Google Docs URL (docs.google.com/document/d/.../edit)'
    });
  }

  return await fetchGoogleDocsContent(url, res);
}

