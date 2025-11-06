interface TabCardProps {
  title: string;
  url?: string;
  favicon?: string | null;
  isActive: boolean;
  isLoading: boolean;
  onClick: () => void;
  onClose: (e: React.MouseEvent) => void;
}

export default function TabCard({
  title,
  url,
  favicon,
  isActive,
  isLoading,
  onClick,
  onClose
}: TabCardProps) {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(e);
  };

  const displayTitle = title || 'New Tab';
  const displayUrl = url ? new URL(url).hostname : '';

  return (
    <div 
      className={`tab-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {isLoading && <div className="tab-loading-indicator" />}
      
      <div className="tab-favicon">
        {favicon ? (
          <img src={favicon} alt="" />
        ) : (
          <div className="placeholder">●</div>
        )}
      </div>

      <div className="tab-content">
        <div className="tab-title">{displayTitle}</div>
        {displayUrl && <div className="tab-url">{displayUrl}</div>}
      </div>

      <button 
        className="tab-close"
        onClick={handleClose}
        aria-label="Close tab"
        title="Close tab"
      >
        ×
      </button>
    </div>
  );
}
