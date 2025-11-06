# Astra - Architecture Notes

## Renderer: React + Vite

- **Entry HTML**: `index.html`
- **React mount point**: `#root` div element
- **Renderer entry**: `src/renderer.tsx`
- **Root component**: `src/App.tsx`
- **Components directory**: `src/components/`

### Configuration

- Vite is configured with `@vitejs/plugin-react` in `vite.renderer.config.ts`
- TypeScript uses `"jsx": "react-jsx"` (modern JSX transform) in `tsconfig.json`
- Module resolution set to `"bundler"` for optimal Vite compatibility

### Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 5
- **Desktop Framework**: Electron 39
- **Language**: TypeScript
- **Package Manager**: pnpm

## Browser Architecture

### Main Process: `src/main/`

- **Entry point**: `src/main/main.ts`
- **BrowserController**: Manages the browser window, web content views, and navigation
- **ViewManager**: Handles layout and positioning of WebContentsView within the window

### WebContentsView API

Astra uses Electron's modern **WebContentsView** API (not the deprecated `<webview>` tag) to render web content:

- **Separation of concerns**: The browser UI (toolbar) runs in the main BrowserWindow, while web pages render in a separate WebContentsView
- **Layout management**: ViewManager calculates bounds based on toolbar height and window size, ensuring no visual overlap
- **Multi-tab ready**: Each WebContentsView is encapsulated in a ViewManager, making it trivial to add multiple tabs later

### Session Partitioning

Astra uses explicit session partitioning for security and data isolation:

- **`persist:ui`**: Session for the browser UI (React renderer)
- **`persist:browser`**: Session for web content (pages you browse)
- This ensures browser UI and web content have separate storage, cookies, cache, and permissions

### IPC Architecture

Communication between main process and renderer uses a clean IPC contract defined in `src/common/ipc.ts`:

- **Command channel** (`nav:command`): Renderer sends navigation commands (loadURL, goBack, goForward, reload, stop)
- **State channel** (`nav:state`): Main process broadcasts navigation state updates (URL, loading status, history state)
- **Type-safe**: Union types ensure all commands and state updates are properly typed
- **Extensible**: When multi-tab support is added, the IPC contract can easily include tab identifiers

### URL vs Search Detection

`src/common/url.ts` provides heuristics to distinguish URLs from search queries:

- **Recognized as URLs**: Schemes (http://, https://), domains (example.com), localhost, IPv4 addresses
- **Search queries**: Anything with spaces or not matching URL patterns
- **Default search engine**: Google (`https://www.google.com/search?q=...`)
- **Auto-prefixing**: URLs without schemes get `http://` prepended

### Security

- **Context isolation**: Enabled for both UI and web content
- **Node integration**: Disabled in all contexts
- **Sandbox**: Enabled for web content
- **Permission handler**: Denies all permissions by default (allowlist can be added later)
- **Window open handler**: Opens `target="_blank"` and `window.open()` links in OS default browser
- **Preload script**: Exposes only necessary IPC methods via `contextBridge`, no Node.js APIs

### Multi-Tab Readiness

The current architecture is designed for easy multi-tab extension:

1. **ViewManager abstraction**: Each tab would have its own ViewManager instance
2. **Tab model**: Add a Tab class with id, WebContentsView, and ViewManager
3. **Controller**: Maintain a map of tab id → ViewManager in BrowserController
4. **View switching**: Detach inactive views, attach active view to `win.contentView`
5. **IPC extension**: Add optional `tabId` to NavCommand and NavState
6. **UI component**: Add a tab strip component above the toolbar
