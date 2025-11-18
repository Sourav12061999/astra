import { useEffect, useRef, useState } from 'react';

export interface ContextMenuItem {
  label: string;
  icon?: string;
  shortcut?: string;
  action?: () => void;
  separator?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  submenu?: ContextMenuItem[];
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export default function ContextMenu({
  items,
  position,
  onClose
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to avoid screen edges
  useEffect(() => {
    if (!menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const { x, y } = position;

    let adjustedX = x;
    let adjustedY = y;

    // Check right edge
    if (x + rect.width > window.innerWidth) {
      adjustedX = window.innerWidth - rect.width - 8;
    }

    // Check bottom edge
    if (y + rect.height > window.innerHeight) {
      adjustedY = window.innerHeight - rect.height - 8;
    }

    // Check left edge
    if (adjustedX < 8) {
      adjustedX = 8;
    }

    // Check top edge
    if (adjustedY < 8) {
      adjustedY = 8;
    }

    setAdjustedPosition({ x: adjustedX, y: adjustedY });
  }, [position]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const validItems = items.filter(item => !item.separator && !item.disabled);

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;

        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = prev + 1;
            while (next < items.length && (items[next].separator || items[next].disabled)) {
              next++;
            }
            return next < items.length ? next : prev;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && (items[next].separator || items[next].disabled)) {
              next--;
            }
            return next >= 0 ? next : prev;
          });
          break;

        case 'Enter':
          e.preventDefault();
          const item = items[focusedIndex];
          if (item && !item.separator && !item.disabled && item.action) {
            item.action();
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, focusedIndex, onClose]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled || item.separator) return;
    if (item.action) {
      item.action();
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`
      }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={`sep-${index}`} className="context-menu-separator" />;
        }

        const isFocused = index === focusedIndex;

        return (
          <div
            key={item.label}
            className={`context-menu-item ${item.disabled ? 'disabled' : ''} ${
              item.destructive ? 'destructive' : ''
            } ${isFocused ? 'focused' : ''}`}
            onClick={() => handleItemClick(item)}
            onMouseEnter={() => setFocusedIndex(index)}
          >
            {item.icon && <div className="context-menu-icon">{item.icon}</div>}
            <div className="context-menu-label">{item.label}</div>
            {item.shortcut && (
              <div className="context-menu-shortcut">{item.shortcut}</div>
            )}
            {item.submenu && (
              <div className="context-menu-submenu-arrow">▸</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
