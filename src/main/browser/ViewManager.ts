import { BrowserWindow, WebContentsView } from 'electron';

export type ViewBounds = { x: number; y: number; width: number; height: number };
export type ViewFrame = { top: number; left: number };

export class ViewManager {
  private view: WebContentsView;
  private frame: ViewFrame = { top: 48, left: 0 };
  private isAttached = false;

  constructor(view: WebContentsView) {
    this.view = view;
  }

  setFrame(frame: ViewFrame) {
    this.frame = frame;
  }

  attach(win: BrowserWindow) {
    if (!this.isAttached) {
      win.contentView.addChildView(this.view);
      this.isAttached = true;
      this.applyLayout(win);
    }
  }

  detach(win: BrowserWindow) {
    if (this.isAttached) {
      win.contentView.removeChildView(this.view);
      this.isAttached = false;
    }
  }

  applyLayout(win: BrowserWindow) {
    if (!this.isAttached) return;
    
    const { width, height } = win.getContentBounds();
    const bounds: ViewBounds = {
      x: this.frame.left,
      y: this.frame.top,
      width: Math.max(0, width - this.frame.left),
      height: Math.max(0, height - this.frame.top)
    };
    
    this.view.setBounds(bounds);
  }

  getWebContents() {
    return this.view.webContents;
  }

  getView() {
    return this.view;
  }
}
