import { useEffect, useState, useRef } from 'react';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import './styles/app.css';
import './styles/sidebar.css';
import { TabState } from './common/ipc';

const TOOLBAR_HEIGHT = 49;
const SIDEBAR_WIDTH = 240;

export default function App() {
  const [navState, setNavState] = useState({
    url: '',
    title: '',
    isLoading: false,
    canGoBack: false,
    canGoForward: false,
    isSecure: false
  });
  const [tabsState, setTabsState] = useState<TabState>({
    tabs: [],
    activeId: null,
    order: []
  });
  const [inputValue, setInputValue] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to navigation state updates
    if (!window.api) {
      console.error('window.api is undefined; preload script may have failed to load');
      return;
    }

    const unsubscribeNav = window.api.nav.onState((state) => {
      setNavState(state);
      setInputValue(state.url);
    });

    const unsubscribeTabs = window.api.tabs.onState((state) => {
      setTabsState(state);
    });

    // Report UI frame dimensions
    const reportFrame = () => {
      window.api.ui.setFrame({
        top: TOOLBAR_HEIGHT,
        left: SIDEBAR_WIDTH
      });
    };
    
    setTimeout(reportFrame, 0);
    window.addEventListener('resize', reportFrame);

    // Focus omnibox on mount
    setTimeout(() => {
      (window as any).focusOmnibox?.();
    }, 100);

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + T: New tab
      if (cmdOrCtrl && e.key === 't') {
        e.preventDefault();
        window.api.tabs.create();
        return;
      }

      // Cmd/Ctrl + W: Close tab
      if (cmdOrCtrl && e.key === 'w') {
        e.preventDefault();
        if (tabsState.activeId) {
          window.api.tabs.close(tabsState.activeId);
        }
        return;
      }

      // Cmd/Ctrl + Tab: Next tab
      if (cmdOrCtrl && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        window.api.tabs.next();
        return;
      }

      // Cmd/Ctrl + Shift + Tab: Previous tab
      if (cmdOrCtrl && e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        window.api.tabs.prev();
        return;
      }

      // Cmd/Ctrl + Shift + [ or ]: Previous/Next tab
      if (cmdOrCtrl && e.shiftKey && e.key === '[') {
        e.preventDefault();
        window.api.tabs.prev();
        return;
      }
      if (cmdOrCtrl && e.shiftKey && e.key === ']') {
        e.preventDefault();
        window.api.tabs.next();
        return;
      }

      // Cmd/Ctrl + 1-9: Switch to tab by index
      if (cmdOrCtrl && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        window.api.tabs.switchToIndex(index);
        return;
      }

      // Cmd/Ctrl + L: Focus omnibox
      if (cmdOrCtrl && e.key === 'l') {
        e.preventDefault();
        (window as any).focusOmnibox?.();
        return;
      }

      // Cmd/Ctrl + R: Reload
      if (cmdOrCtrl && e.key === 'r') {
        e.preventDefault();
        window.api.nav.reload();
        return;
      }

      // Escape: Stop loading
      if (e.key === 'Escape' && navState.isLoading) {
        window.api.nav.stop();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribeNav();
      unsubscribeTabs();
      window.removeEventListener('resize', reportFrame);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navState.isLoading, tabsState.activeId]);

  const handleSubmit = () => {
    window.api.nav.loadURL(inputValue);
  };

  const handleCreateTab = () => {
    window.api.tabs.create();
  };

  const handleSwitchTab = (tabId: string) => {
    window.api.tabs.switch(tabId);
  };

  const handleCloseTab = (tabId: string) => {
    window.api.tabs.close(tabId);
  };

  return (
    <>
      <Sidebar
        tabs={tabsState.tabs}
        activeId={tabsState.activeId}
        onCreate={handleCreateTab}
        onSelect={handleSwitchTab}
        onClose={handleCloseTab}
      />
      
      <div className="app-main">
        <div ref={toolbarRef}>
          <Toolbar
            url={navState.url}
            isLoading={navState.isLoading}
            canGoBack={navState.canGoBack}
            canGoForward={navState.canGoForward}
            isSecure={navState.isSecure}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmit={handleSubmit}
            onBack={() => window.api.nav.goBack()}
            onForward={() => window.api.nav.goForward()}
            onReload={() => window.api.nav.reload()}
            onStop={() => window.api.nav.stop()}
          />
        </div>
      </div>
    </>
  );
}
