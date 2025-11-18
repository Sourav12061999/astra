import { useEffect, useState, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import AIChat from './components/AIChat';
import { storage } from './utils/storage';
import './styles/app.css';
import './styles/sidebar.css';
import './styles/animations.css';
import './styles/ai-chat.css';
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
    order: [],
    groups: [],
    pinnedOrder: [],
    recentlyClosed: []
  });
  const [inputValue, setInputValue] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return storage.get<boolean>('ui.sidebarCollapsed', false) || false;
  });
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

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
      const sidebarWidth = sidebarCollapsed ? 0 : SIDEBAR_WIDTH;
      window.api.ui.setFrame({
        top: TOOLBAR_HEIGHT,
        left: sidebarWidth
      });
    };
    
    setTimeout(reportFrame, 0);
    window.addEventListener('resize', reportFrame);

    // Focus omnibox on mount
    setTimeout(() => {
      (window as any).focusOmnibox?.();
    }, 100);

    return () => {
      unsubscribeNav();
      unsubscribeTabs();
      window.removeEventListener('resize', reportFrame);
    };
  }, [sidebarCollapsed]);

  // Persist sidebar collapsed state
  useEffect(() => {
    storage.setImmediate('ui.sidebarCollapsed', sidebarCollapsed);
    // Update UI frame when sidebar toggles
    const sidebarWidth = sidebarCollapsed ? 0 : SIDEBAR_WIDTH;
    window.api.ui.setFrame({
      top: TOOLBAR_HEIGHT,
      left: sidebarWidth
    });
  }, [sidebarCollapsed]);

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

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const toggleAIChat = () => {
    setAiChatOpen(prev => !prev);
  };

  // Keyboard shortcuts with react-hotkeys-hook
  // Basic tab operations
  useHotkeys('mod+t', (e) => {
    e.preventDefault();
    window.api.tabs.create();
  }, []);

  useHotkeys('mod+w', (e) => {
    e.preventDefault();
    if (tabsState.activeId) {
      window.api.tabs.close(tabsState.activeId);
    }
  }, [tabsState.activeId]);

  useHotkeys('mod+tab', (e) => {
    e.preventDefault();
    window.api.tabs.next();
  }, []);

  useHotkeys('mod+shift+tab', (e) => {
    e.preventDefault();
    window.api.tabs.prev();
  }, []);

  useHotkeys('mod+shift+[', (e) => {
    e.preventDefault();
    window.api.tabs.prev();
  }, []);

  useHotkeys('mod+shift+]', (e) => {
    e.preventDefault();
    window.api.tabs.next();
  }, []);

  // Switch to tab by number
  useHotkeys('mod+1', (e) => { e.preventDefault(); window.api.tabs.switchToIndex(0); }, []);
  useHotkeys('mod+2', (e) => { e.preventDefault(); window.api.tabs.switchToIndex(1); }, []);
  useHotkeys('mod+3', (e) => { e.preventDefault(); window.api.tabs.switchToIndex(2); }, []);
  useHotkeys('mod+4', (e) => { e.preventDefault(); window.api.tabs.switchToIndex(3); }, []);
  useHotkeys('mod+5', (e) => { e.preventDefault(); window.api.tabs.switchToIndex(4); }, []);
  useHotkeys('mod+6', (e) => { e.preventDefault(); window.api.tabs.switchToIndex(5); }, []);
  useHotkeys('mod+7', (e) => { e.preventDefault(); window.api.tabs.switchToIndex(6); }, []);
  useHotkeys('mod+8', (e) => { e.preventDefault(); window.api.tabs.switchToIndex(7); }, []);
  useHotkeys('mod+9', (e) => { e.preventDefault(); window.api.tabs.switchToIndex(8); }, []);

  // Navigation
  useHotkeys('mod+l', (e) => {
    e.preventDefault();
    (window as any).focusOmnibox?.();
  }, []);

  useHotkeys('mod+r', (e) => {
    e.preventDefault();
    window.api.nav.reload();
  }, []);

  useHotkeys('escape', (e) => {
    if (navState.isLoading) {
      e.preventDefault();
      window.api.nav.stop();
    }
  }, [navState.isLoading]);

  // Sidebar toggle
  useHotkeys('mod+b', (e) => {
    e.preventDefault();
    toggleSidebar();
  }, []);

  useHotkeys('mod+alt+]', (e) => {
    e.preventDefault();
    setSidebarCollapsed(false);
  }, []);

  useHotkeys('mod+alt+[', (e) => {
    e.preventDefault();
    setSidebarCollapsed(true);
  }, []);

  // Enhanced tab operations
  useHotkeys('mod+d', (e) => {
    e.preventDefault();
    if (tabsState.activeId) {
      window.api.tabs.duplicate(tabsState.activeId);
    }
  }, [tabsState.activeId]);

  useHotkeys('mod+shift+t', (e) => {
    e.preventDefault();
    window.api.tabs.reopenLastClosed();
  }, []);

  useHotkeys('mod+p', (e) => {
    e.preventDefault();
    if (tabsState.activeId) {
      window.api.tabs.togglePin(tabsState.activeId);
    }
  }, [tabsState.activeId]);

  useHotkeys('mod+shift+m', (e) => {
    e.preventDefault();
    if (tabsState.activeId) {
      window.api.tabs.toggleMute(tabsState.activeId);
    }
  }, [tabsState.activeId]);

  // Group operations
  useHotkeys('mod+shift+g', (e) => {
    e.preventDefault();
    if (tabsState.activeId) {
      window.api.tabs.createGroup('New Group', 'blue', [tabsState.activeId]);
    }
  }, [tabsState.activeId]);

  useHotkeys('mod+shift+u', (e) => {
    e.preventDefault();
    const activeTab = tabsState.tabs.find(t => t.id === tabsState.activeId);
    if (activeTab?.groupId) {
      window.api.tabs.moveToGroup(activeTab.id, null);
    }
  }, [tabsState.activeId, tabsState.tabs]);

  // Tab search
  useHotkeys('mod+f', (e) => {
    e.preventDefault();
    (window as any).focusTabSearch?.();
  }, []);

  // Close window
  useHotkeys('mod+shift+w', (e) => {
    e.preventDefault();
    window.api.app.closeWindow();
  }, []);

  // Toggle AI Chat
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    toggleAIChat();
  }, []);

  return (
    <>
      <div ref={sidebarRef}>
        <Sidebar
          tabs={tabsState.tabs}
          activeId={tabsState.activeId}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          onCreate={handleCreateTab}
          onSelect={handleSwitchTab}
          onClose={handleCloseTab}
        />
      </div>
      
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
            onToggleAI={toggleAIChat}
            isAIChatOpen={aiChatOpen}
          />
        </div>
      </div>

      <AIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </>
  );
}
