export type TabId = string;

export type NavCommand =
  | { type: 'loadURL'; urlOrQuery: string; tabId?: TabId }
  | { type: 'goBack'; tabId?: TabId }
  | { type: 'goForward'; tabId?: TabId }
  | { type: 'reload'; tabId?: TabId }
  | { type: 'stop'; tabId?: TabId }
  | { type: 'setTopChromeHeight'; height: number };

export type NavState = {
  url: string;
  title: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  isSecure: boolean;
  tabId?: TabId;
};

export type TabCommand =
  | { action: 'create'; url?: string }
  | { action: 'close'; tabId: TabId }
  | { action: 'switch'; tabId: TabId }
  | { action: 'next' }
  | { action: 'prev' }
  | { action: 'switchToIndex'; index: number };

export type TabMeta = {
  id: TabId;
  title: string;
  url: string;
  favicon: string | null;
  isLoading: boolean;
  isActive: boolean;
};

export type TabState = {
  tabs: TabMeta[];
  activeId: TabId | null;
  order: TabId[];
};

export type UIFrame = {
  top: number;
  left: number;
};

export const IPC_CHANNELS = {
  command: 'nav:command',
  state: 'nav:state',
  focusOmnibox: 'ui:focus-omnibox',
  tabCommand: 'tab:command',
  tabState: 'tab:state',
  uiSetFrame: 'ui:set-frame'
} as const;

export type Channels = typeof IPC_CHANNELS;
