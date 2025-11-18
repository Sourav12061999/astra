import path from 'node:path';
import { app, ipcMain, Menu, BrowserWindow } from 'electron';
import started from 'electron-squirrel-startup';
import { BrowserController } from './browser/BrowserController';
import { IPC_CHANNELS, NavCommand, TabCommand, UIFrame, AIAgentRequest, AIAgentResponse } from '../common/ipc';
import { AIAgent } from './ai/AIAgent';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

function uiPreloadPath() {
  return path.join(__dirname, 'preload.js');
}

function indexHtmlOrDevURL() {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    return MAIN_WINDOW_VITE_DEV_SERVER_URL;
  }
  return path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
}

let controller: BrowserController;
let aiAgent: AIAgent | null = null;

// Initialize AI Agent with API key from environment variable or config
// Users will need to set their GOOGLE_GEMINI_API_KEY environment variable
const initializeAIAgent = (apiKey?: string) => {
  const key = apiKey || process.env.GOOGLE_GEMINI_API_KEY;
  if (key) {
    aiAgent = new AIAgent(key);
    return true;
  }
  return false;
};

app.whenReady().then(async () => {
  // Try to initialize AI Agent
  initializeAIAgent();
  controller = new BrowserController(uiPreloadPath());
  await controller.ready(indexHtmlOrDevURL());

  // Minimal application menu with reload and devtools
  const menu = Menu.buildFromTemplate([
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    controller = new BrowserController(uiPreloadPath());
    controller.ready(indexHtmlOrDevURL());
  }
});

ipcMain.handle(IPC_CHANNELS.command, (_evt, cmd: NavCommand) => {
  if (cmd.type === 'setTopChromeHeight') {
    // Legacy command - ignore for now since we use ui:set-frame
    return;
  }
  controller.handleNavCommand(cmd);
});

ipcMain.handle(IPC_CHANNELS.tabCommand, (_evt, cmd: TabCommand) => {
  controller.handleTabCommand(cmd);
});

ipcMain.handle(IPC_CHANNELS.uiSetFrame, (_evt, frame: UIFrame) => {
  controller.handleUISetFrame(frame);
});

ipcMain.handle(IPC_CHANNELS.aiSetApiKey, (_evt, apiKey: string) => {
  return initializeAIAgent(apiKey);
});

ipcMain.handle(IPC_CHANNELS.aiAgent, async (_evt, request: AIAgentRequest): Promise<AIAgentResponse> => {
  if (!aiAgent) {
    throw new Error('AI Agent not initialized. Please set your Google Gemini API key.');
  }
  
  try {
    const response = await aiAgent.processPrompt(request.prompt, request.conversationHistory || []);
    return response;
  } catch (error) {
    console.error('AI Agent error:', error);
    throw error;
  }
});
