# Quick Setup Guide

## Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up your Google Gemini API key**:
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API key:
   ```
   GOOGLE_GEMINI_API_KEY=your-actual-api-key-here
   ```
   
   Get your API key from: https://makersuite.google.com/app/apikey

3. **Start the browser**:
   ```bash
   pnpm start
   ```

## Features

### ✅ Multi-Tab Support
- Fully functional tab sidebar
- Create, switch, and close tabs
- Keyboard shortcuts (Cmd/Ctrl+T, Cmd/Ctrl+W, etc.)

### 🤖 AI Browser Agent
- Click the 🤖 button or press Cmd/Ctrl+K to open the AI chat
- Ask questions and the AI will:
  - Search Google
  - Visit relevant webpages
  - Extract and read content
  - Provide comprehensive answers with sources

## Usage Examples

Try asking the AI:
- "What's the latest news about TypeScript?"
- "Find information about Electron best practices"
- "Compare React vs Vue frameworks"
- "Explain how WebAssembly works"

## Troubleshooting

**AI not working?**
- Make sure your API key is set correctly
- Check the console for errors (Cmd/Ctrl+Shift+I)
- Ensure you have internet connection

**Tabs not showing?**
- Press Cmd/Ctrl+B to toggle the sidebar
- Try creating a new tab with Cmd/Ctrl+T

For more detailed information, see `AI_BROWSER_GUIDE.md`.
