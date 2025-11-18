// Drag and drop utilities for tab reordering and grouping

export interface DragData {
  type: 'tab' | 'group';
  id: string;
  groupId?: string | null;
  isPinned?: boolean;
}

export interface DropPosition {
  type: 'before' | 'after' | 'inside';
  targetId: string;
}

/**
 * Sets a custom drag image with optional scaling
 */
export function setCustomDragImage(
  event: React.DragEvent,
  element: HTMLElement,
  scale = 0.7
): void {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.opacity = String(scale);
  clone.style.transform = `scale(${scale})`;
  clone.style.position = 'absolute';
  clone.style.top = '-9999px';
  clone.style.pointerEvents = 'none';
  
  document.body.appendChild(clone);
  
  event.dataTransfer.setDragImage(clone, element.offsetWidth / 2, element.offsetHeight / 2);
  
  // Clean up after a short delay
  setTimeout(() => {
    document.body.removeChild(clone);
  }, 0);
}

/**
 * Encodes drag data to JSON string for dataTransfer
 */
export function setDragData(event: React.DragEvent, data: DragData): void {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('application/json', JSON.stringify(data));
}

/**
 * Decodes drag data from dataTransfer
 */
export function getDragData(event: React.DragEvent): DragData | null {
  try {
    const json = event.dataTransfer.getData('application/json');
    if (!json) return null;
    return JSON.parse(json) as DragData;
  } catch (error) {
    console.error('Failed to parse drag data:', error);
    return null;
  }
}

/**
 * Computes drop position (before/after/inside) based on mouse position relative to target
 */
export function getDropPosition(
  event: React.DragEvent,
  targetElement: HTMLElement,
  allowInside = false
): 'before' | 'after' | 'inside' {
  const rect = targetElement.getBoundingClientRect();
  const mouseY = event.clientY;
  const relativeY = mouseY - rect.top;
  const height = rect.height;
  
  if (allowInside) {
    // Three zones: top 25%, middle 50%, bottom 25%
    if (relativeY < height * 0.25) return 'before';
    if (relativeY > height * 0.75) return 'after';
    return 'inside';
  } else {
    // Two zones: top 50%, bottom 50%
    return relativeY < height / 2 ? 'before' : 'after';
  }
}

/**
 * Checks if a target element is a group folder
 */
export function isGroupDropTarget(element: HTMLElement): boolean {
  return element.classList.contains('group-folder') || 
         element.closest('.group-folder') !== null;
}

/**
 * Checks if a target is in the pinned area
 */
export function isPinnedAreaTarget(element: HTMLElement): boolean {
  return element.classList.contains('pinned-tabs') ||
         element.closest('.pinned-tabs') !== null;
}

/**
 * Throttles dragover event handler for performance
 */
export function throttleDragOver<T extends (...args: any[]) => void>(
  func: T,
  delay = 50
): T {
  let lastCall = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  }) as T;
}

/**
 * Adds drop zone highlighting class
 */
export function addDropZoneHighlight(
  element: HTMLElement,
  position: 'before' | 'after' | 'inside'
): void {
  element.classList.add('drop-target');
  element.setAttribute('data-drop-position', position);
}

/**
 * Removes drop zone highlighting
 */
export function removeDropZoneHighlight(element: HTMLElement): void {
  element.classList.remove('drop-target');
  element.removeAttribute('data-drop-position');
}

/**
 * Removes all drop zone highlights from document
 */
export function clearAllDropZones(): void {
  document.querySelectorAll('.drop-target').forEach(el => {
    el.classList.remove('drop-target');
    el.removeAttribute('data-drop-position');
  });
}

/**
 * Gets the closest droppable element from event target
 */
export function getClosestDroppable(
  target: EventTarget | null,
  selector: string
): HTMLElement | null {
  if (!(target instanceof HTMLElement)) return null;
  
  // Check if target itself matches
  if (target.matches(selector)) return target;
  
  // Check parents
  return target.closest(selector);
}

/**
 * Generates a stable color from a string (for favicon fallbacks)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#007aff', '#5856d6', '#af52de', '#ff2d55',
    '#ff3b30', '#ff9500', '#ffcc00', '#34c759',
    '#00c7be', '#32ade6'
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Extracts domain initial for favicon fallback
 */
export function getDomainInitial(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    return hostname.charAt(0).toUpperCase();
  } catch {
    return '●';
  }
}
