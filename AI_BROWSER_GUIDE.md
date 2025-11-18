# AI-Powered Browser Guide

This browser now includes an AI agent powered by Google Gemini that can search the web, read webpages, and provide intelligent responses to your queries.

## Features Implemented

### 1. Multi-Tab Support ✅
- **Fixed**: Multi-tab sidebar now correctly displays all open tabs
- **Features**:
  - Create new tabs with Cmd/Ctrl+T
  - Switch between tabs by clicking in the sidebar
  - Close tabs with the X button or Cmd/Ctrl+W
  - Navigate between tabs with Cmd/Ctrl+Tab

### 2. AI Agent Browser 🤖 ✅
- **Capabilities**:
  - Performs Google searches based on your queries
  - Opens and reads multiple web pages
  - Extracts content from websites
  - Provides comprehensive answers based on gathered information
  - Shows you which searches were performed and pages visited

## Getting Started

### Prerequisites
You need a Google Gemini API key to use the AI agent features.

1. **Get your API key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Set up the API key** (Choose one method):

   **Option A: Environment Variable (Recommended)**
   ```bash
   export GOOGLE_GEMINI_API_KEY="your-api-key-here"
   ```

   **Option B: Through the UI**
   - Click the 🔑 button in the AI chat panel
   - Paste your API key
   - Click "Set Key"

### Running the Browser

```bash
# Install dependencies
pnpm install

# Start the browser
pnpm start
```

## Using the AI Agent

### Opening the AI Chat
- **Keyboard Shortcut**: `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- **UI Button**: Click the 🤖 button in the toolbar

### Example Queries

The AI agent works by:
1. Understanding your question
2. Performing relevant Google searches
3. Visiting the top results
4. Reading and analyzing the content
5. Providing a comprehensive answer with sources

**Example prompts:**
- "What's the latest news about artificial intelligence?"
- "Find information about React 19 new features"
- "Compare TypeScript vs JavaScript"
- "What are the best practices for Electron app development?"
- "Explain how browser engines work"

### How It Works

When you ask a question:

1. **Search Phase**: The AI decides what to search for and performs Google searches
2. **Exploration Phase**: Opens the most relevant links from search results
3. **Analysis Phase**: Reads and extracts content from visited pages
4. **Response Phase**: Synthesizes information and provides an answer

You can see:
- 🔍 **Searches Performed**: All Google searches the AI made
- 📄 **Pages Visited**: Websites the AI read
- Click any search result or visited page to open it in your browser

## Keyboard Shortcuts

### Browser Navigation
- `Cmd/Ctrl+T` - New tab
- `Cmd/Ctrl+W` - Close tab
- `Cmd/Ctrl+Tab` - Next tab
- `Cmd/Ctrl+Shift+Tab` - Previous tab
- `Cmd/Ctrl+L` - Focus address bar
- `Cmd/Ctrl+R` - Reload page
- `Cmd/Ctrl+B` - Toggle sidebar

### AI Agent
- `Cmd/Ctrl+K` - Toggle AI chat panel

## Technical Details

### Architecture
- **Frontend**: React + TypeScript
- **Backend**: Electron with Node.js
- **AI SDK**: Vercel AI SDK with Google Gemini
- **Web Scraping**: Cheerio for content extraction
- **Search**: Google Search (web scraping)

### AI Agent Workflow
```
User Prompt
    ↓
Google Gemini (with tools)
    ↓
┌─────────────────┬─────────────────┐
│   searchGoogle  │    visitPage    │
│   (tool)        │    (tool)       │
└─────────────────┴─────────────────┘
    ↓                   ↓
Search Results      Page Content
    ↓                   ↓
    └───────┬───────────┘
            ↓
      AI Analysis
            ↓
    Formatted Response
```

### Key Components
- `src/main/ai/AIAgent.ts` - Core AI agent logic
- `src/components/AIChat.tsx` - AI chat UI
- `src/main/tabs/TabManager.ts` - Multi-tab management
- `src/common/ipc.ts` - IPC communication types

## Troubleshooting

### AI Agent Not Working
1. **Check API Key**: Make sure your Google Gemini API key is set correctly
2. **Check Console**: Open DevTools (Cmd/Ctrl+Shift+I) and check for errors
3. **Network Issues**: Ensure you have internet connection for searches

### Search Not Returning Results
- Google may be rate-limiting or blocking requests
- Try waiting a few seconds and asking again
- Some pages may block content extraction

### Performance
- The AI agent may take 10-30 seconds to respond depending on:
  - Number of searches needed
  - Number of pages visited
  - Page loading times
  - AI processing time

## Limitations

1. **Search Rate Limits**: Google may rate-limit search requests
2. **Content Extraction**: Some websites block scraping or have complex structures
3. **Response Time**: Complex queries may take longer to process
4. **API Costs**: Google Gemini API has usage limits and costs

## Future Enhancements

Potential improvements:
- [ ] Better search API integration (Google Custom Search)
- [ ] Cached search results
- [ ] Screenshot capture of visited pages
- [ ] Export conversation history
- [ ] Multiple AI model support
- [ ] Custom search engines
- [ ] Advanced filtering and ranking

## Support

For issues or questions:
1. Check the console logs in DevTools
2. Review the AI_BROWSER_GUIDE.md
3. Check environment variable setup

## License

MIT License - See LICENSE file for details
