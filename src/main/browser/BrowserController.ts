import { BrowserWindow, session, shell } from 'electron';
import { TabManager } from '../tabs/TabManager';
import { IPC_CHANNELS, NavState, TabState, NavCommand, TabCommand, UIFrame } from '../../common/ipc';

export class BrowserController {
  win: BrowserWindow;
  tabManager: TabManager;

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

    // Initialize TabManager
    this.tabManager = new TabManager(this.win);

    // Basic security policies for browser session
    const browserSession = session.fromPartition('persist:browser');
    browserSession.setPermissionRequestHandler((wc, permission, callback) => {
      // Deny by default; add allowlist as needed later
      callback(false);
    });

    this.wireEvents();
  }

  async ready(loadURLForUI: string) {
    // Register ready-to-show before loading to ensure we catch the event
    this.win.once('ready-to-show', () => {
      this.win.show();
      // Open DevTools in separate windows
      this.win.webContents.openDevTools({ mode: 'detach' });
      
      // Create initial tab after a slight delay to allow UI to initialize
      setTimeout(() => {
        this.tabManager.createTab('https://www.google.com');
      }, 200);
    });

    // Load the React UI in the window
    if (loadURLForUI.startsWith('http')) {
      await this.win.loadURL(loadURLForUI);
    } else {
      await this.win.loadFile(loadURLForUI);
    }
  }

  handleNavCommand(cmd: NavCommand) {
    this.tabManager.handleNavCommand(cmd);
  }

  handleTabCommand(cmd: TabCommand) {
    this.tabManager.handleTabCommand(cmd);
  }

  handleUISetFrame(frame: UIFrame) {
    this.tabManager.updateFrame(frame);
  }

  private broadcastNavState(state: NavState) {
    this.win.webContents.send(IPC_CHANNELS.state, state);
  }

  private broadcastTabState(state: TabState) {
    this.win.webContents.send(IPC_CHANNELS.tabState, state);
  }

  wireEvents() {
    // Resize handling
    const relayout = () => this.tabManager.updateLayout();
    this.win.on('resize', relayout);
    this.win.on('maximize', relayout);
    this.win.on('unmaximize', relayout);
    this.win.on('enter-full-screen', relayout);
    this.win.on('leave-full-screen', relayout);

    // Window cleanup
    this.win.on('closed', () => {
      this.tabManager.destroy();
    });

    // Listen to TabManager state changes
    this.tabManager.on('state', (state: TabState) => {
      this.broadcastTabState(state);
    });

    this.tabManager.on('navState', (state: NavState) => {
      this.broadcastNavState(state);
    });
  }
}
