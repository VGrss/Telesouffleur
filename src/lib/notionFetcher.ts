/**
 * Fetches and extracts text content from a public Notion page
 */
export interface NotionContent {
  title: string;
  content: string;
  wordCount: number;
}

/**
 * Extracts text content from a public Notion page URL
 * @param url - The public Notion page URL
 * @returns Promise with the extracted content
 */
export async function fetchNotionContent(url: string): Promise<NotionContent> {
  // Validate Notion URL format
  if (!isValidNotionUrl(url)) {
    throw new Error('Invalid Notion URL. Please provide a valid public Notion page URL.');
  }

  try {
    // Call our serverless API endpoint instead of fetching directly from Notion
    const response = await fetch('/api/notion-fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const content = await response.json();
    return content;
  } catch (error) {
    if (error instanceof Error) {
      // If the API fails, try a simple fallback approach
      console.warn('API fetch failed, trying fallback method:', error.message);
      return await fetchNotionContentFallback(url);


      
    }
    throw new Error('Failed to fetch content from Notion page');
  }
}

/**
 * Fallback method that tries to extract content using a simpler approach
 */
async function fetchNotionContentFallback(url: string): Promise<NotionContent> {
  try {
    // Try to fetch the page directly (this might fail due to CORS, but worth trying)
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Simple and direct text extraction - like copying from browser
    let content = html
      // Remove all script and style content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      // Remove HTML tags but preserve line breaks
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]*>/g, ' ')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Extract title from HTML
    let title = 'Notion Page';
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      // Try meta og:title
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
      if (ogTitleMatch) {
        title = ogTitleMatch[1].trim();
      }
    }

    const wordCount = content.split(/\s+/).length;

    return {
      title,
      content,
      wordCount
    };
  } catch (error) {
    throw new Error('Unable to fetch Notion content. Please ensure the page is publicly accessible and try again.');
  }
}

/**
 * Fetches content from a Google Docs URL
 */
export async function fetchGoogleDocsContent(url: string): Promise<NotionContent> {
  try {
    const response = await fetch('/api/google-docs-fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Unable to fetch Google Docs content. Please ensure the document is publicly accessible and try again.');
  }
}

/**
 * Validates if a URL is a valid Google Docs URL
 */
export function isValidGoogleDocsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'docs.google.com' && 
           urlObj.pathname.includes('/document/d/');
  } catch {
    return false;
  }
}

/**
 * Validates if a URL is a valid Notion page URL (legacy support)
 */
export function isValidNotionUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'www.notion.so' || urlObj.hostname === 'notion.so';
  } catch {
    return false;
  }
}

