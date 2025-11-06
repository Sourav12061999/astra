import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, NavCommand, NavState } from './common/ipc';

const api = {
  nav: {
    loadURL: (urlOrQuery: string) => ipcRenderer.invoke(IPC_CHANNELS.command, { type: 'loadURL', urlOrQuery } as NavCommand),
    goBack: () => ipcRenderer.invoke(IPC_CHANNELS.command, { type: 'goBack' } as NavCommand),
    goForward: () => ipcRenderer.invoke(IPC_CHANNELS.command, { type: 'goForward' } as NavCommand),
    reload: () => ipcRenderer.invoke(IPC_CHANNELS.command, { type: 'reload' } as NavCommand),
    stop: () => ipcRenderer.invoke(IPC_CHANNELS.command, { type: 'stop' } as NavCommand),
    setTopChromeHeight: (height: number) => ipcRenderer.invoke(IPC_CHANNELS.command, { type: 'setTopChromeHeight', height } as NavCommand)
  },
  onNavState: (handler: (s: NavState) => void) => {
    const listener = (_: unknown, s: NavState) => handler(s);
    ipcRenderer.on(IPC_CHANNELS.state, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.state, listener);
  }
};

declare global {
  interface Window {
    api: typeof api;
  }
}

contextBridge.exposeInMainWorld('api', api);
