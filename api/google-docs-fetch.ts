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
           urlObj.pathname.includes('/document/d/') &&
           urlObj.pathname.includes('/edit');
  } catch {
    return false;
  }
}

async function extractTextFromGoogleDocsHtml(html: string): Promise<GoogleDocsContent> {
  // Extract title from meta tags
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
  const title = titleMatch ? titleMatch[1] : 'Google Document';

  // Extract description which often contains the main content
  const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
  const description = descMatch ? descMatch[1] : '';

  // Try to extract content from various sources
  let content = '';

  // Method 1: Use the description if it's substantial, but preserve basic formatting
  if (description && description.length > 20 && description !== 'Google Docs') {
    content = description;
  } else {
    // Method 2: Try to find text content in the HTML with better formatting preservation
    // Remove script and style tags
    let cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    cleanHtml = cleanHtml.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
    
    // Convert HTML elements to preserve line breaks and paragraph structure
    cleanHtml = cleanHtml
      // Convert paragraph endings to double line breaks
      .replace(/<\/p[^>]*>/gi, '\n\n')
      // Convert line breaks to single line breaks
      .replace(/<br\s*\/?>/gi, '\n')
      // Convert div endings to line breaks (Google Docs uses divs for lines)
      .replace(/<\/div[^>]*>/gi, '\n')
      // Convert heading endings to double line breaks
      .replace(/<\/h[1-6][^>]*>/gi, '\n\n')
      // Convert list items to line breaks with bullets
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li[^>]*>/gi, '\n')
      // Remove all remaining HTML tags
      .replace(/<[^>]*>/g, '');

    // Extract text from common content areas if we find them
    const contentMatches = cleanHtml.match(/class="[^"]*content[^"]*"[^>]*>([\s\S]*?)(?=<\/[^>]*>|$)/gi);
    if (contentMatches && contentMatches.length > 0) {
      content = contentMatches
        .map(match => match.replace(/<[^>]*>/g, ''))
        .join('\n')
        .trim();
    } else {
      content = cleanHtml.trim();
    }

    // If still no good content, try a more aggressive approach
    if (!content || content.length < 10) {
      // Look for the main document content div/span patterns
      const docContentMatch = html.match(/<div[^>]*class="[^"]*kix-[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);
      if (docContentMatch) {
        content = docContentMatch
          .map(match => {
            return match
              .replace(/<\/p[^>]*>/gi, '\n\n')
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<\/div[^>]*>/gi, '\n')
              .replace(/<\/span[^>]*>/gi, '')
              .replace(/<[^>]*>/g, '')
              .trim();
          })
          .filter(text => text.length > 0)
          .join('\n\n');
      }
    }
  }

  // Clean up the content while preserving line breaks
  content = content
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Clean up excessive whitespace but preserve line breaks
    .replace(/[ \t]+/g, ' ') // Multiple spaces/tabs to single space
    .replace(/\n[ \t]+/g, '\n') // Remove spaces/tabs at start of lines
    .replace(/[ \t]+\n/g, '\n') // Remove spaces/tabs at end of lines
    .replace(/\n{3,}/g, '\n\n') // Maximum of 2 consecutive line breaks
    .trim();

  // If we still don't have good content, try to get it from the URL directly
  if (!content || content.length < 10) {
    content = `Contenu du document Google Docs: ${title}\n\nPour accéder au contenu complet, veuillez copier le texte directement depuis le document Google Docs et le coller dans l'éditeur.`;
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
    console.log(`Fetching Google Docs content from: ${url}`);

    // Try to fetch the Google Docs page
    const response = await fetch(url, {
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

