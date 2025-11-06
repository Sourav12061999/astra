import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, NavCommand, NavState, TabCommand, TabState, UIFrame } from './common/ipc';

const api = {
  nav: {
    loadURL: (urlOrQuery: string, tabId?: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.command, { type: 'loadURL', urlOrQuery, tabId } as NavCommand),
    goBack: (tabId?: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.command, { type: 'goBack', tabId } as NavCommand),
    goForward: (tabId?: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.command, { type: 'goForward', tabId } as NavCommand),
    reload: (tabId?: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.command, { type: 'reload', tabId } as NavCommand),
    stop: (tabId?: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.command, { type: 'stop', tabId } as NavCommand),
    onState: (handler: (s: NavState) => void) => {
      const listener = (_: unknown, s: NavState) => handler(s);
      ipcRenderer.on(IPC_CHANNELS.state, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.state, listener);
    }
  },
  tabs: {
    create: (url?: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'create', url } as TabCommand),
    close: (tabId: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'close', tabId } as TabCommand),
    switch: (tabId: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'switch', tabId } as TabCommand),
    next: () => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'next' } as TabCommand),
    prev: () => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'prev' } as TabCommand),
    switchToIndex: (index: number) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'switchToIndex', index } as TabCommand),
    onState: (handler: (s: TabState) => void) => {
      const listener = (_: unknown, s: TabState) => handler(s);
      ipcRenderer.on(IPC_CHANNELS.tabState, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.tabState, listener);
    }
  },
  ui: {
    setFrame: (frame: UIFrame) => 
      ipcRenderer.invoke(IPC_CHANNELS.uiSetFrame, frame)
  }
};

declare global {
  interface Window {
    api: typeof api;
  }
}

contextBridge.exposeInMainWorld('api', api);
