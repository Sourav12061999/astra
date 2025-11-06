import { BrowserWindow } from 'electron';
import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { Tab, createTab } from './Tab';
import { TabState, TabCommand, NavCommand, NavState } from '../../common/ipc';

export class TabManager extends EventEmitter {
  private win: BrowserWindow;
  private tabs: Map<string, Tab> = new Map();
  private order: string[] = [];
  private activeTabId: string | null = null;
  private frame = { top: 48, left: 0 };
  private broadcastTimer: NodeJS.Timeout | null = null;

  constructor(win: BrowserWindow) {
    super();
    this.win = win;
  }

  createTab(url?: string): string {
    const id = randomUUID();
    // Default to Google homepage if no URL provided
    const tab = createTab(id, url || 'https://www.google.com');

    // Listen to tab updates
    tab.on('updated', () => {
      this.scheduleBroadcast();
      // Also broadcast nav state if this is the active tab
      if (this.activeTabId === id) {
        this.broadcastNavState();
      }
    });

    this.tabs.set(id, tab);
    this.order.push(id);

    // Switch to new tab
    this.switchTab(id);

    return id;
  }

  closeTab(tabId: string) {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    // Minimum 1 tab rule: create replacement if closing last tab
    if (this.tabs.size === 1) {
      this.createTab();
    }

    // Determine next active tab before closing
    const index = this.order.indexOf(tabId);
    let nextActiveId: string | null = null;

    if (tabId === this.activeTabId) {
      // Choose previous neighbor, or next if no previous
      if (index > 0) {
        nextActiveId = this.order[index - 1];
      } else if (index < this.order.length - 1) {
        nextActiveId = this.order[index + 1];
      }
    }

    // Detach and destroy
    if (tabId === this.activeTabId) {
      tab.detach(this.win);
    }
    tab.destroy();

    // Remove from tracking
    this.tabs.delete(tabId);
    this.order = this.order.filter(id => id !== tabId);

    // Switch to next active if needed
    if (nextActiveId) {
      this.switchTab(nextActiveId);
    } else if (this.activeTabId === tabId) {
      this.activeTabId = null;
    }

    this.scheduleBroadcast();
  }

  switchTab(tabId: string) {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    // Detach current active tab
    if (this.activeTabId && this.activeTabId !== tabId) {
      const currentTab = this.tabs.get(this.activeTabId);
      if (currentTab) {
        currentTab.setActive(false);
        currentTab.detach(this.win);
      }
    }

    // Attach new active tab
    this.activeTabId = tabId;
    tab.setActive(true);
    tab.attach(this.win, this.frame);

    this.scheduleBroadcast();
    this.broadcastNavState();
  }

  nextTab() {
    if (this.order.length === 0) return;
    const currentIndex = this.activeTabId ? this.order.indexOf(this.activeTabId) : -1;
    const nextIndex = (currentIndex + 1) % this.order.length;
    this.switchTab(this.order[nextIndex]);
  }

  prevTab() {
    if (this.order.length === 0) return;
    const currentIndex = this.activeTabId ? this.order.indexOf(this.activeTabId) : 0;
    const prevIndex = (currentIndex - 1 + this.order.length) % this.order.length;
    this.switchTab(this.order[prevIndex]);
  }

  switchToIndex(index: number) {
    if (index >= 0 && index < this.order.length) {
      this.switchTab(this.order[index]);
    }
  }

  getActiveTab(): Tab | undefined {
    return this.activeTabId ? this.tabs.get(this.activeTabId) : undefined;
  }

  getState(): TabState {
    const tabs = this.order.map(id => {
      const tab = this.tabs.get(id);
      if (!tab) {
        return {
          id,
          title: 'Unknown',
          url: '',
          favicon: null,
          isLoading: false,
          isActive: false
        };
      }
      return {
        ...tab.meta,
        isActive: id === this.activeTabId
      };
    });

    return {
      tabs,
      activeId: this.activeTabId,
      order: [...this.order]
    };
  }

  updateFrame(frame: { top: number; left: number }) {
    this.frame = frame;
    
    // Update active tab layout
    const activeTab = this.getActiveTab();
    if (activeTab) {
      activeTab.viewManager.setFrame(frame);
      activeTab.updateLayout(this.win);
    }
  }

  updateLayout() {
    const activeTab = this.getActiveTab();
    if (activeTab) {
      activeTab.updateLayout(this.win);
    }
  }

  handleNavCommand(cmd: NavCommand) {
    const targetTab = cmd.tabId ? this.tabs.get(cmd.tabId) : this.getActiveTab();
    if (!targetTab) return;

    switch (cmd.type) {
      case 'loadURL':
        targetTab.loadURL(cmd.urlOrQuery);
        break;
      case 'goBack':
        targetTab.goBack();
        break;
      case 'goForward':
        targetTab.goForward();
        break;
      case 'reload':
        targetTab.reload();
        break;
      case 'stop':
        targetTab.stop();
        break;
    }
  }

  handleTabCommand(cmd: TabCommand) {
    switch (cmd.action) {
      case 'create':
        this.createTab(cmd.url);
        break;
      case 'close':
        this.closeTab(cmd.tabId);
        break;
      case 'switch':
        this.switchTab(cmd.tabId);
        break;
      case 'next':
        this.nextTab();
        break;
      case 'prev':
        this.prevTab();
        break;
      case 'switchToIndex':
        this.switchToIndex(cmd.index);
        break;
    }
  }

  private scheduleBroadcast() {
    // Debounce broadcasts to avoid excessive updates
    if (this.broadcastTimer) {
      clearTimeout(this.broadcastTimer);
    }
    
    this.broadcastTimer = setTimeout(() => {
      this.emit('state', this.getState());
      this.broadcastTimer = null;
    }, 16); // ~60fps
  }

  private broadcastNavState() {
    const activeTab = this.getActiveTab();
    if (activeTab) {
      this.emit('navState', activeTab.getNavState());
    }
  }

  destroy() {
    // Clear broadcast timer
    if (this.broadcastTimer) {
      clearTimeout(this.broadcastTimer);
      this.broadcastTimer = null;
    }

    // Destroy all tabs
    for (const tab of this.tabs.values()) {
      tab.detach(this.win);
      tab.destroy();
    }

    this.tabs.clear();
    this.order = [];
    this.activeTabId = null;
    this.removeAllListeners();
  }
}
