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

## Multi-Tab Architecture

### Overview

Astra now supports full multi-tab browsing with an Arc-inspired vertical sidebar. Each tab is an independent browsing session with its own WebContentsView, navigation history, and state.

### Tab Model (`src/main/tabs/Tab.ts`)

Each tab is represented by a `Tab` class that extends `EventEmitter`:

- **Properties**:
  - `id`: Unique identifier (UUID)
  - `view`: WebContentsView instance for rendering web content
  - `viewManager`: ViewManager instance for layout management
  - `meta`: TabMeta object containing title, URL, favicon, loading state, and active state

- **Lifecycle Methods**:
  - `attach(win, frame)`: Adds view to window with proper bounds considering UI margins
  - `detach(win)`: Removes view from window
  - `destroy()`: Cleans up listeners and destroys webContents

- **Navigation Methods**: `loadURL()`, `goBack()`, `goForward()`, `reload()`, `stop()`

- **Event Handling**: Listens to webContents events (did-navigate, page-title-updated, page-favicon-updated, etc.) and emits "updated" events

### Tab Management (`src/main/tabs/TabManager.ts`)

The `TabManager` class orchestrates all tabs for a window:

- **Responsibilities**:
  - Maintains `Map<id, Tab>` of all tabs and their order
  - Tracks `activeTabId` and manages view attachment/detachment
  - Broadcasts state changes to renderer via debounced events (16ms)

- **Key Methods**:
  - `createTab(url?)`: Creates new tab and switches to it
  - `closeTab(id)`: Closes tab with minimum-1-tab rule (auto-creates replacement)
  - `switchTab(id)`: Detaches current, attaches target tab
  - `nextTab()` / `prevTab()`: Cycle through tabs
  - `switchToIndex(n)`: Jump to specific tab position
  - `updateFrame(frame)`: Updates UI margins for active tab layout
  - `handleNavCommand(cmd)`: Routes navigation commands to appropriate tab
  - `handleTabCommand(cmd)`: Handles tab management commands

- **Smart Tab Closing**: When closing active tab, selects previous neighbor (or next if no previous)

### ViewManager Enhancements (`src/main/browser/ViewManager.ts`)

Updated to support tab switching with UI margins:

- `setFrame(frame)`: Stores `{ top, left }` UI margins
- `attach(win)` / `detach(win)`: Manages view lifecycle
- `applyLayout(win)`: Computes bounds as:
  - `x = frame.left`, `y = frame.top`
  - `width = windowWidth - frame.left`
  - `height = windowHeight - frame.top`

### Extended IPC Contract (`src/common/ipc.ts`)

**New Types**:
- `TabId`: String identifier for tabs
- `TabMeta`: Tab metadata (id, title, url, favicon, isLoading, isActive)
- `TabState`: Complete tabs state (tabs array, activeId, order)
- `TabCommand`: Union of tab actions (create, close, switch, next, prev, switchToIndex)
- `UIFrame`: UI margins `{ top, left }`

**Extended Types**:
- `NavCommand`: Now accepts optional `tabId` parameter
- `NavState`: Now includes optional `tabId`

**New Channels**:
- `tab:command`: Tab management commands from renderer
- `tab:state`: Tab state broadcasts to renderer
- `ui:set-frame`: UI frame dimensions from renderer

### Renderer Integration

**Sidebar Component (`src/components/Sidebar.tsx`)**:
- Vertical tab list (Arc-style)
- New tab button at top
- Scrollable tab cards with favicon, title, URL, and close button
- Active tab highlighting with accent bar

**TabCard Component (`src/components/TabCard.tsx`)**:
- Compact card showing tab state
- Favicon (or placeholder)
- Title and hostname display
- Close button (hidden until hover, always visible for active tab)
- Loading indicator animation

**App Integration (`src/App.tsx`)**:
- Subscribes to `tabs:state` and `nav:state` channels
- Reports UI frame dimensions (`{ top: 49, left: 240 }`) to main process
- Keyboard shortcuts:
  - **Cmd/Ctrl+T**: New tab
  - **Cmd/Ctrl+W**: Close tab
  - **Cmd/Ctrl+Tab** / **Cmd/Ctrl+Shift+Tab**: Next/Previous tab
  - **Cmd/Ctrl+1-9**: Jump to tab by position
  - **Cmd/Ctrl+Shift+[** / **]**: Previous/Next tab

**Layout**: 
- Root: Flex row (sidebar + main area)
- Sidebar: Fixed 240px width, full height
- Main area: Flex-grow with toolbar at top (49px height)

### Styling

**Arc-Inspired Design (`src/styles/sidebar.css`)**:
- Clean, minimal vertical sidebar
- Tab cards with rounded corners (10px), subtle hover states
- Active tab: White background (light mode), shadow, left accent bar in brand color (#007aff)
- Smooth transitions (0.15s)
- Custom scrollbar (6px, rounded)
- Dark mode support via `prefers-color-scheme`
- Slide-in animation for new tabs

### Performance Optimizations

- **Debounced State Broadcasts**: TabManager debounces state updates (16ms) to avoid excessive IPC
- **Lazy View Attachment**: Only active tab's view is attached to window; inactive tabs are detached
- **Proper Cleanup**: Tabs destroy webContents and remove all listeners when closed
