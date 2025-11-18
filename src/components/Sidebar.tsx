import TabCard from './TabCard';
import { TabMeta } from '../common/ipc';

interface SidebarProps {
  tabs: TabMeta[];
  activeId: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

export default function Sidebar({
  tabs,
  activeId,
  collapsed,
  onToggleCollapse,
  onCreate,
  onSelect,
  onClose
}: SidebarProps) {
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          title="Toggle Sidebar (Cmd/Ctrl+B)"
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>
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
