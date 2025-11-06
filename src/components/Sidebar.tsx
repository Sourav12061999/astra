import TabCard from './TabCard';
import { TabMeta } from '../common/ipc';

interface SidebarProps {
  tabs: TabMeta[];
  activeId: string | null;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

export default function Sidebar({
  tabs,
  activeId,
  onCreate,
  onSelect,
  onClose
}: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button 
          className="new-tab-btn"
          onClick={onCreate}
          title="New Tab (Cmd/Ctrl+T)"
          aria-label="New Tab"
        >
          +
        </button>
      </div>

      <div className="tabs-list">
        {tabs.map(tab => (
          <TabCard
            key={tab.id}
            title={tab.title}
            url={tab.url}
            favicon={tab.favicon}
            isActive={tab.isActive}
            isLoading={tab.isLoading}
            onClick={() => onSelect(tab.id)}
            onClose={() => onClose(tab.id)}
          />
        ))}
      </div>
    </div>
  );
}
