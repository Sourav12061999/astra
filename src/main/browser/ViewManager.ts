import { BrowserWindow, WebContentsView } from 'electron';

export type ViewBounds = { x: number; y: number; width: number; height: number };

export class ViewManager {
  private win: BrowserWindow;
  private view: WebContentsView;
  private bounds: ViewBounds = { x: 0, y: 48, width: 0, height: 0 };
  private isAttached = false;

  constructor(win: BrowserWindow, view: WebContentsView) {
    this.win = win;
    this.view = view;
    // Add the view but with proper initial positioning
    this.win.contentView.addChildView(this.view);
    this.isAttached = true;
    // Set initial layout to position view below toolbar area
    this.layout();
  }

  setTopInset(px: number) {
    console.log('ViewManager setTopInset called with:', px);
    this.bounds.y = Math.max(0, Math.floor(px));
    this.layout();
  }

  layout() {
    const { width, height } = this.win.getContentBounds();
    this.bounds.width = width;
    this.bounds.height = Math.max(0, height - this.bounds.y);
    console.log('Setting view bounds:', JSON.stringify(this.bounds));
    console.log('Window content bounds:', JSON.stringify({ width, height }));
    this.view.setBounds(this.bounds);
  }

  getWebContents() {
    return this.view.webContents;
  }
}
