import path from 'node:path';
import { app, ipcMain, Menu, BrowserWindow } from 'electron';
import started from 'electron-squirrel-startup';
import { BrowserController } from './browser/BrowserController';
import { IPC_CHANNELS, NavCommand } from '../common/ipc';

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

app.whenReady().then(async () => {
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
  switch (cmd.type) {
    case 'loadURL':
      controller.navigate(cmd.urlOrQuery);
      break;
    case 'goBack':
      controller.goBack();
      break;
    case 'goForward':
      controller.goForward();
      break;
    case 'reload':
      controller.reload();
      break;
    case 'stop':
      controller.stop();
      break;
    case 'setTopChromeHeight':
      controller.setTopChromeHeight(cmd.height);
      break;
  }
});
