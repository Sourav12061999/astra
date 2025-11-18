import { google } from '@ai-sdk/google';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface AIAgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIAgentResponse {
  response: string;
  searches: SearchResult[];
  visitedPages: PageContent[];
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface PageContent {
  url: string;
  title: string;
  content: string;
}

export class AIAgent {
  private apiKey: string;
  private searchEngine = 'https://www.google.com/search';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Perform a Google search and return results
   */
  private async performGoogleSearch(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(this.searchEngine, {
        params: {
          q: query,
          num: 5
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      // Parse Google search results
      $('.g').each((_, element) => {
        const titleElement = $(element).find('h3').first();
        const linkElement = $(element).find('a').first();
        const snippetElement = $(element).find('.VwiC3b, .yXK7lf').first();

        const title = titleElement.text();
        const url = linkElement.attr('href');
        const snippet = snippetElement.text();

        if (title && url && url.startsWith('http')) {
          results.push({
            title,
            url,
            snippet: snippet || ''
          });
        }
      });

      return results.slice(0, 5);
    } catch (error) {
      console.error('Google search error:', error);
      return [];
    }
  }

  /**
   * Extract main content from a webpage
   */
  private async extractPageContent(url: string): Promise<PageContent | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);

      // Remove script, style, and other non-content elements
      $('script, style, nav, header, footer, iframe, noscript').remove();

      // Get page title
      const title = $('title').text() || $('h1').first().text() || 'Untitled';

      // Try to get main content
      let content = '';
      
      // First try common article/main content selectors
      const contentSelectors = [
        'article',
        'main',
        '[role="main"]',
        '.article-content',
        '.post-content',
        '.entry-content',
        '.content',
        'body'
      ];

      for (const selector of contentSelectors) {
        const element = $(selector).first();
        if (element.length) {
          content = element.text();
          break;
        }
      }

      // Clean up the content
      content = content
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000); // Limit to 5000 chars

      return {
        url,
        title,
        content
      };
    } catch (error) {
      console.error(`Error extracting content from ${url}:`, error);
      return null;
    }
  }

  /**
   * Process user prompt with AI agent capabilities
   */
  async processPrompt(prompt: string, conversationHistory: AIAgentMessage[] = []): Promise<AIAgentResponse> {
    const searches: SearchResult[] = [];
    const visitedPages: PageContent[] = [];

    try {
      const model = google('gemini-2.0-flash-exp', {
        apiKey: this.apiKey
      });

      // Define tools for the AI agent
      const searchTool = tool({
        description: 'Perform a Google search to find information. Use this when you need to search for current information on the web.',
        parameters: z.object({
          query: z.string().describe('The search query to look up on Google')
        }),
        execute: async ({ query }) => {
          console.log(`Performing search: ${query}`);
          const results = await this.performGoogleSearch(query);
          searches.push(...results);
          return { results };
        }
      });

      const visitPageTool = tool({
        description: 'Visit a webpage and extract its content. Use this to read the actual content of a webpage after finding it through search.',
        parameters: z.object({
          url: z.string().describe('The URL of the webpage to visit and extract content from')
        }),
        execute: async ({ url }) => {
          console.log(`Visiting page: ${url}`);
          const content = await this.extractPageContent(url);
          if (content) {
            visitedPages.push(content);
            return { 
              success: true, 
              title: content.title,
              content: content.content 
            };
          }
          return { 
            success: false, 
            error: 'Failed to extract content from the page' 
          };
        }
      });

      // Build conversation messages
      const messages = [
        {
          role: 'system' as const,
          content: `You are an AI-powered web browser assistant. You can search Google and visit webpages to answer user questions. 

Instructions:
1. When a user asks a question, first search Google for relevant information
2. Then visit the most relevant pages from the search results
3. Read and analyze the content from those pages
4. Provide a comprehensive answer based on the information you gathered
5. Always cite the sources you used

Be thorough in your research but also efficient. Visit 2-3 relevant pages for most queries.`
        },
        ...conversationHistory,
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      // Generate response with tool calling
      const result = await generateText({
        model,
        messages,
        tools: {
          searchGoogle: searchTool,
          visitPage: visitPageTool
        },
        maxSteps: 10, // Allow multiple tool calls
        temperature: 0.7
      });

      return {
        response: result.text,
        searches,
        visitedPages
      };
    } catch (error) {
      console.error('AI Agent error:', error);
      throw error;
    }
  }
}
