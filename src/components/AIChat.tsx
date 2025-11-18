import { useState, useRef, useEffect } from 'react';
import { AIAgentMessage, AIAgentResponse, AISearchResult, AIPageContent } from '../common/ipc';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChat({ isOpen, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<AIAgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [currentSearches, setCurrentSearches] = useState<AISearchResult[]>([]);
  const [currentPages, setCurrentPages] = useState<AIPageContent[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if API key is set via environment variable
    const checkApiKey = async () => {
      try {
        // Try sending a test request to see if API key is configured
        const testResult = await window.api.ai.setApiKey('');
        setIsApiKeySet(testResult);
      } catch {
        setIsApiKeySet(false);
      }
    };
    checkApiKey();
  }, []);

  const handleSetApiKey = async () => {
    if (!apiKey.trim()) return;
    
    try {
      const success = await window.api.ai.setApiKey(apiKey);
      if (success) {
        setIsApiKeySet(true);
        setShowApiKeyInput(false);
        setApiKey('');
      } else {
        alert('Failed to set API key');
      }
    } catch (error) {
      alert('Error setting API key: ' + error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: AIAgentMessage = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentSearches([]);
    setCurrentPages([]);

    try {
      const response: AIAgentResponse = await window.api.ai.sendPrompt({
        prompt: input,
        conversationHistory: messages
      });

      const assistantMessage: AIAgentMessage = {
        role: 'assistant',
        content: response.response
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentSearches(response.searches);
      setCurrentPages(response.visitedPages);
    } catch (error) {
      console.error('AI Agent error:', error);
      const errorMessage: AIAgentMessage = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response. Please make sure your API key is set correctly.'}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setCurrentSearches([]);
    setCurrentPages([]);
  };

  const openUrl = (url: string) => {
    window.api.nav.loadURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-overlay">
      <div className="ai-chat-panel">
        <div className="ai-chat-header">
          <div className="ai-chat-title">
            <span className="ai-icon">🤖</span>
            <h2>AI Browser Agent</h2>
          </div>
          <div className="ai-chat-actions">
            {!isApiKeySet && (
              <button 
                className="api-key-btn"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                title="Set Google Gemini API Key"
              >
                🔑
              </button>
            )}
            {messages.length > 0 && (
              <button 
                className="clear-btn"
                onClick={handleClearChat}
                title="Clear chat"
              >
                🗑️
              </button>
            )}
            <button 
              className="close-btn"
              onClick={onClose}
              title="Close AI Chat"
            >
              ✕
            </button>
          </div>
        </div>

        {showApiKeyInput && (
          <div className="api-key-input-container">
            <input
              type="password"
              placeholder="Enter your Google Gemini API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSetApiKey()}
              className="api-key-input"
            />
            <button onClick={handleSetApiKey} className="set-api-key-btn">
              Set Key
            </button>
          </div>
        )}

        {!isApiKeySet && !showApiKeyInput && (
          <div className="api-key-warning">
            ⚠️ Please set your Google Gemini API key to use the AI agent.
            <button onClick={() => setShowApiKeyInput(true)}>Set API Key</button>
          </div>
        )}

        <div className="ai-chat-messages">
          {messages.length === 0 && (
            <div className="ai-welcome">
              <h3>Welcome to AI Browser Agent!</h3>
              <p>I can help you search the web and gather information.</p>
              <p>Try asking me:</p>
              <ul>
                <li>"What's the latest news about AI?"</li>
                <li>"Find information about Electron.js"</li>
                <li>"Compare React vs Vue frameworks"</li>
              </ul>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`ai-message ${msg.role}`}>
              <div className="message-icon">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="ai-message assistant">
              <div className="message-icon">🤖</div>
              <div className="message-content">
                <div className="loading-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          )}

          {currentSearches.length > 0 && (
            <div className="ai-searches">
              <h4>🔍 Searches Performed:</h4>
              <div className="search-results">
                {currentSearches.map((search, idx) => (
                  <div key={idx} className="search-result" onClick={() => openUrl(search.url)}>
                    <div className="search-title">{search.title}</div>
                    <div className="search-url">{search.url}</div>
                    {search.snippet && <div className="search-snippet">{search.snippet}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPages.length > 0 && (
            <div className="ai-pages">
              <h4>📄 Pages Visited:</h4>
              <div className="visited-pages">
                {currentPages.map((page, idx) => (
                  <div key={idx} className="visited-page" onClick={() => openUrl(page.url)}>
                    <div className="page-title">{page.title}</div>
                    <div className="page-url">{page.url}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="ai-chat-input-form">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isApiKeySet ? "Ask me anything..." : "Set API key first..."}
            className="ai-chat-input"
            disabled={!isApiKeySet || isLoading}
          />
          <button 
            type="submit" 
            className="ai-chat-submit"
            disabled={!isApiKeySet || isLoading || !input.trim()}
          >
            {isLoading ? '⏳' : '🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
