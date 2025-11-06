export type NavCommand =
  | { type: 'loadURL'; urlOrQuery: string }
  | { type: 'goBack' }
  | { type: 'goForward' }
  | { type: 'reload' }
  | { type: 'stop' }
  | { type: 'setTopChromeHeight'; height: number };

export type NavState = {
  url: string;
  title: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  isSecure: boolean;
};

export const IPC_CHANNELS = {
  command: 'nav:command',
  state: 'nav:state',
  focusOmnibox: 'ui:focus-omnibox'
} as const;

export type Channels = typeof IPC_CHANNELS;
