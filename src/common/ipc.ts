export type TabId = string;
export type GroupId = string;

export type GroupColor =
  | 'blue'
  | 'purple'
  | 'pink'
  | 'green'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'gray'
  | 'teal'
  | 'indigo';

export type TabGroup = {
  id: GroupId;
  name: string;
  color: GroupColor;
  isExpanded: boolean;
  tabIds: TabId[];
};

export type RecentlyClosedEntry = {
  title: string;
  url: string;
  favicon: string | null;
  closedAt: number;
};

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
  | { action: 'switchToIndex'; index: number }
  | { action: 'duplicate'; tabId: TabId }
  | { action: 'reopenLastClosed' }
  | { action: 'togglePin'; tabId: TabId }
  | { action: 'toggleMute'; tabId: TabId }
  | { action: 'reorder'; fromId: TabId; toId: TabId; position: 'before' | 'after' }
  | { action: 'moveToGroup'; tabId: TabId; groupId: GroupId | null }
  | { action: 'createGroup'; name?: string; color?: GroupColor; tabIds?: TabId[] }
  | { action: 'deleteGroup'; groupId: GroupId }
  | { action: 'renameGroup'; groupId: GroupId; name: string }
  | { action: 'setGroupColor'; groupId: GroupId; color: GroupColor }
  | { action: 'setGroupExpanded'; groupId: GroupId; isExpanded: boolean }
  | { action: 'closeTabsInGroup'; groupId: GroupId }
  | { action: 'ungroup'; groupId: GroupId };

export type AppCommand = { type: 'closeWindow' };

export type TabMeta = {
  id: TabId;
  title: string;
  url: string;
  favicon: string | null;
  isLoading: boolean;
  isActive: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  hasAudio?: boolean;
  groupId?: GroupId | null;
};

export type TabState = {
  tabs: TabMeta[];
  activeId: TabId | null;
  order: TabId[];
  groups: TabGroup[];
  pinnedOrder: TabId[];
  recentlyClosed: RecentlyClosedEntry[];
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
  uiSetFrame: 'ui:set-frame',
  appCommand: 'app:command'
} as const;

export type Channels = typeof IPC_CHANNELS;
