import { BrowserWindow, WebContentsView, session, shell } from 'electron';
import { EventEmitter } from 'node:events';
import { ViewManager } from '../browser/ViewManager';
import { TabMeta } from '../../common/ipc';
import { toNavigableURL } from '../../common/url';

export class Tab extends EventEmitter {
  readonly id: string;
  readonly view: WebContentsView;
  readonly viewManager: ViewManager;
  
  private _meta: TabMeta;
  private destroyed = false;

  constructor(id: string, defaultURL?: string) {
    super();
    this.id = id;

    // Create WebContentsView with browser session
    this.view = new WebContentsView({
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        partition: 'persist:browser',
        webSecurity: true,
        scrollBounce: true
      }
    });

    this.viewManager = new ViewManager(this.view);

    this._meta = {
      id,
      title: 'New Tab',
      url: defaultURL || '',
      favicon: null,
      isLoading: false,
      isActive: false,
      isPinned: false,
      isMuted: false,
      hasAudio: false,
      groupId: null
    };

    // Set window open handler for this tab
    this.webContents.setWindowOpenHandler(({ url }) => {
      // Open target="_blank" and window.open() in OS default browser
      shell.openExternal(url);
      return { action: 'deny' };
    });

    this.wireEvents();

    // Load URL if provided
    if (defaultURL) {
      this.loadURL(defaultURL);
    }
  }

  get webContents() {
    return this.view.webContents;
  }

  get meta(): TabMeta {
    return { ...this._meta };
  }

  private wireEvents() {
    const wc = this.webContents;

    wc.on('did-start-loading', () => {
      this._meta.isLoading = true;
      this.emit('updated', this.meta);
    });

    wc.on('did-stop-loading', () => {
      this._meta.isLoading = false;
      this.emit('updated', this.meta);
    });

    wc.on('did-navigate', () => {
      this._meta.url = wc.getURL();
      this.emit('updated', this.meta);
    });

    wc.on('did-navigate-in-page', () => {
      this._meta.url = wc.getURL();
      this.emit('updated', this.meta);
    });

    wc.on('page-title-updated', (_, title) => {
      this._meta.title = title || 'Untitled';
      this.emit('updated', this.meta);
    });

    wc.on('page-favicon-updated', (_, favicons) => {
      this._meta.favicon = favicons[0] || null;
      this.emit('updated', this.meta);
    });

    // Audio events
    wc.on('media-started-playing', () => {
      this._meta.hasAudio = true;
      this.emit('updated', this.meta);
    });

    wc.on('media-paused', () => {
      this._meta.hasAudio = false;
      this.emit('updated', this.meta);
    });

    wc.on('destroyed', () => {
      this.destroyed = true;
    });
  }

  attach(win: BrowserWindow, frame: { top: number; left: number }) {
    this.viewManager.setFrame(frame);
    this.viewManager.attach(win);
    this.webContents.focus();
  }

  detach(win: BrowserWindow) {
    this.viewManager.detach(win);
  }

  updateLayout(win: BrowserWindow) {
    this.viewManager.applyLayout(win);
  }

  setActive(active: boolean) {
    this._meta.isActive = active;
  }

  setPinned(pinned: boolean) {
    this._meta.isPinned = pinned;
    this.emit('updated', this.meta);
  }

  setGroupId(groupId: string | null) {
    this._meta.groupId = groupId;
    this.emit('updated', this.meta);
  }

  toggleMute() {
    if (this.destroyed) return;
    this._meta.isMuted = !this._meta.isMuted;
    this.webContents.setAudioMuted(this._meta.isMuted);
    this.emit('updated', this.meta);
  }

  setMuted(muted: boolean) {
    if (this.destroyed) return;
    this._meta.isMuted = muted;
    this.webContents.setAudioMuted(muted);
    this.emit('updated', this.meta);
  }

  loadURL(urlOrQuery: string) {
    if (this.destroyed) return;
    const url = toNavigableURL(urlOrQuery);
    this.webContents.loadURL(url);
  }

  goBack() {
    if (this.destroyed) return;
    if (this.webContents.navigationHistory.canGoBack()) {
      this.webContents.navigationHistory.goBack();
    }
  }

  goForward() {
    if (this.destroyed) return;
    if (this.webContents.navigationHistory.canGoForward()) {
      this.webContents.navigationHistory.goForward();
    }
  }

  reload() {
    if (this.destroyed) return;
    this.webContents.reload();
  }

  stop() {
    if (this.destroyed) return;
    this.webContents.stop();
  }

  getNavState() {
    return {
      url: this._meta.url,
      title: this._meta.title,
      isLoading: this._meta.isLoading,
      canGoBack: this.webContents.navigationHistory.canGoBack(),
      canGoForward: this.webContents.navigationHistory.canGoForward(),
      isSecure: this._meta.url.startsWith('https:'),
      tabId: this.id
    };
  }

  destroy() {
    if (this.destroyed) return;
    this.removeAllListeners();
    
    // Destroy the web contents if not already destroyed
    if (!this.webContents.isDestroyed()) {
      this.webContents.destroy();
    }
    
    this.destroyed = true;
  }
}

export function createTab(id: string, url?: string): Tab {
  return new Tab(id, url);
}
