import { TabMeta } from '../common/ipc';
import { getDomainInitial, stringToColor } from '../utils/dragDrop';

interface PinnedTabProps {
  tab: TabMeta;
  isActive: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function PinnedTab({
  tab,
  isActive,
  onClick,
  onContextMenu
}: PinnedTabProps) {
  const { title, url, favicon } = tab;

  return (
    <div
      className={`pinned-tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={`${title}\n${url}`}
    >
      <div className="tab-favicon">
        {favicon ? (
          <img src={favicon} alt="" />
        ) : (
          <div
            className="favicon-fallback"
            style={{ background: stringToColor(url) }}
          >
            {getDomainInitial(url)}
          </div>
        )}
      </div>
    </div>
  );
}
