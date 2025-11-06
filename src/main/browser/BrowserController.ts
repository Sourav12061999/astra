import { BrowserWindow, WebContentsView, shell } from 'electron';
import { ViewManager } from './ViewManager';
import { IPC_CHANNELS, NavState } from '../../common/ipc';
import { toNavigableURL } from '../../common/url';

export class BrowserController {
  win: BrowserWindow;
  view: WebContentsView;
  views: ViewManager;
  topChromeHeight = 48;

  constructor(uiPreloadPath: string) {
    this.win = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      title: 'Astra',
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        partition: 'persist:ui',
        preload: uiPreloadPath
      }
    });

    // Web content session kept separate from UI
    const webPrefs = {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      partition: 'persist:browser',
      webSecurity: true
    } as const;

    this.view = new WebContentsView({ webPreferences: webPrefs });
    this.views = new ViewManager(this.win, this.view);
    this.views.setTopInset(this.topChromeHeight);

    // Basic security policies
    const webSession = this.view.webContents.session;
    webSession.setPermissionRequestHandler((wc, permission, callback) => {
      // Deny by default; add allowlist as needed later
      callback(false);
    });

    this.view.webContents.setWindowOpenHandler(({ url }) => {
      // Open target blank and window.open in the OS browser for now
      shell.openExternal(url);
      return { action: 'deny' };
    });

    this.wireEvents();
  }

  async ready(loadURLForUI: string) {
    // Register ready-to-show before loading to ensure we catch the event
    this.win.once('ready-to-show', () => {
      this.win.show();
      // Open DevTools in separate windows
      this.win.webContents.openDevTools({ mode: 'detach' });
      this.view.webContents.openDevTools({ mode: 'detach' });
      // Delay initial navigation to allow toolbar to report its height first
      setTimeout(() => {
        this.navigate('https://www.google.com');
      }, 200);
    });

    // Load the React UI in the window
    if (loadURLForUI.startsWith('http')) {
      await this.win.loadURL(loadURLForUI);
    } else {
      await this.win.loadFile(loadURLForUI);
    }
  }

  setTopChromeHeight(h: number) {
    console.log('Setting top chrome height to:', h);
    this.topChromeHeight = h;
    this.views.setTopInset(h);
  }

  navigate(input: string) {
    const url = toNavigableURL(input);
    this.view.webContents.loadURL(url);
  }

  goBack() {
    if (this.view.webContents.navigationHistory.canGoBack()) {
      this.view.webContents.navigationHistory.goBack();
    }
  }

  goForward() {
    if (this.view.webContents.navigationHistory.canGoForward()) {
      this.view.webContents.navigationHistory.goForward();
    }
  }

  reload() {
    this.view.webContents.reload();
  }

  stop() {
    this.view.webContents.stop();
  }

  broadcastState() {
    const wc = this.view.webContents;
    const state: NavState = {
      url: wc.getURL(),
      title: wc.getTitle(),
      isLoading: wc.isLoading(),
      canGoBack: wc.navigationHistory.canGoBack(),
      canGoForward: wc.navigationHistory.canGoForward(),
      isSecure: wc.getURL().startsWith('https:')
    };
    this.win.webContents.send(IPC_CHANNELS.state, state);
  }

  wireEvents() {
    const wc = this.view.webContents;

    // Resize handling
    const relayout = () => this.views.layout();
    this.win.on('resize', relayout);
    this.win.on('maximize', relayout);
    this.win.on('unmaximize', relayout);
    this.win.on('enter-full-screen', relayout);
    this.win.on('leave-full-screen', relayout);

    // Navigation events
    wc.on('did-start-loading', () => this.broadcastState());
    wc.on('did-stop-loading', () => this.broadcastState());
    wc.on('did-finish-load', () => this.broadcastState());
    wc.on('did-fail-load', () => this.broadcastState());
    wc.on('did-navigate', () => this.broadcastState());
    wc.on('did-navigate-in-page', () => this.broadcastState());
    wc.on('page-title-updated', () => this.broadcastState());

    // Keep UI in sync at startup too
    this.win.webContents.on('did-finish-load', () => this.broadcastState());
  }
}
