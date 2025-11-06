import { BrowserWindow, WebContentsView } from 'electron';

export type ViewBounds = { x: number; y: number; width: number; height: number };

export class ViewManager {
  private win: BrowserWindow;
  private view: WebContentsView;
  private bounds: ViewBounds = { x: 0, y: 48, width: 0, height: 0 };

  constructor(win: BrowserWindow, view: WebContentsView) {
    this.win = win;
    this.view = view;
    this.win.contentView.addChildView(this.view);
  }

  setTopInset(px: number) {
    this.bounds.y = Math.max(0, Math.floor(px));
    this.layout();
  }

  layout() {
    const { width, height } = this.win.getContentBounds();
    this.bounds.width = width;
    this.bounds.height = Math.max(0, height - this.bounds.y);
    this.view.setBounds(this.bounds);
  }

  getWebContents() {
    return this.view.webContents;
  }
}
