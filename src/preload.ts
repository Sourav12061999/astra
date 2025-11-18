import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, NavCommand, NavState, TabCommand, TabState, UIFrame, AppCommand, GroupColor } from './common/ipc';

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
    // Basic tab operations
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
    
    // Enhanced tab operations
    duplicate: (tabId: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'duplicate', tabId } as TabCommand),
    reopenLastClosed: () => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'reopenLastClosed' } as TabCommand),
    togglePin: (tabId: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'togglePin', tabId } as TabCommand),
    toggleMute: (tabId: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'toggleMute', tabId } as TabCommand),
    reorder: (fromId: string, toId: string, position: 'before' | 'after') => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'reorder', fromId, toId, position } as TabCommand),
    
    // Group operations
    moveToGroup: (tabId: string, groupId: string | null) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'moveToGroup', tabId, groupId } as TabCommand),
    createGroup: (name?: string, color?: GroupColor, tabIds?: string[]) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'createGroup', name, color, tabIds } as TabCommand),
    deleteGroup: (groupId: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'deleteGroup', groupId } as TabCommand),
    renameGroup: (groupId: string, name: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'renameGroup', groupId, name } as TabCommand),
    setGroupColor: (groupId: string, color: GroupColor) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'setGroupColor', groupId, color } as TabCommand),
    setGroupExpanded: (groupId: string, isExpanded: boolean) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'setGroupExpanded', groupId, isExpanded } as TabCommand),
    closeTabsInGroup: (groupId: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'closeTabsInGroup', groupId } as TabCommand),
    ungroup: (groupId: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.tabCommand, { action: 'ungroup', groupId } as TabCommand),
    
    // State subscription
    onState: (handler: (s: TabState) => void) => {
      const listener = (_: unknown, s: TabState) => handler(s);
      ipcRenderer.on(IPC_CHANNELS.tabState, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.tabState, listener);
    }
  },
  ui: {
    setFrame: (frame: UIFrame) => 
      ipcRenderer.invoke(IPC_CHANNELS.uiSetFrame, frame)
  },
  app: {
    closeWindow: () => 
      ipcRenderer.invoke(IPC_CHANNELS.appCommand, { type: 'closeWindow' } as AppCommand)
  }
};

declare global {
  interface Window {
    api: typeof api;
  }
}

contextBridge.exposeInMainWorld('api', api);
