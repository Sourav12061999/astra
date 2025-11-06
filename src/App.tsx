import { useEffect, useState, useRef } from 'react';
import Toolbar from './components/Toolbar';
import './styles/app.css';

export default function App() {
  const [navState, setNavState] = useState({
    url: '',
    title: '',
    isLoading: false,
    canGoBack: false,
    canGoForward: false,
    isSecure: false
  });
  const [inputValue, setInputValue] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to navigation state updates
    const unsubscribe = window.api.onNavState((state) => {
      setNavState(state);
      // Always update input value with current URL
      // Only skip if user is actively typing (we'll handle this differently)
      setInputValue(state.url);
    });

    // Measure and report toolbar height
    const reportHeight = () => {
      if (toolbarRef.current) {
        const height = toolbarRef.current.offsetHeight;
        console.log('Reporting toolbar height:', height);
        window.api.nav.setTopChromeHeight(height);
      }
    };
    
    // Use setTimeout to ensure DOM has rendered and has correct height
    setTimeout(reportHeight, 0);
    window.addEventListener('resize', reportHeight);

    // Focus omnibox on mount
    setTimeout(() => {
      (window as any).focusOmnibox?.();
    }, 100);

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + L: Focus omnibox
      if (cmdOrCtrl && e.key === 'l') {
        e.preventDefault();
        (window as any).focusOmnibox?.();
      }

      // Cmd/Ctrl + R: Reload
      if (cmdOrCtrl && e.key === 'r') {
        e.preventDefault();
        window.api.nav.reload();
      }

      // Escape: Stop loading
      if (e.key === 'Escape' && navState.isLoading) {
        window.api.nav.stop();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', reportHeight);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navState.isLoading]);

  const handleSubmit = () => {
    window.api.nav.loadURL(inputValue);
  };

  return (
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
  );
}
