// localStorage utility with typed keys and debounced writes

type StorageKey =
  | 'ui.sidebarCollapsed'
  | 'tabs.groups'
  | 'tabs.pinned'
  | 'tabs.recentlyClosed'
  | 'ui.groupExpandedState';

const debounceTimers = new Map<string, NodeJS.Timeout>();

export const storage = {
  get<T = any>(key: StorageKey, fallback?: T): T | undefined {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return fallback;
    }
  },

  set<T = any>(key: StorageKey, value: T, options?: { debounceMs?: number }): void {
    const debounceMs = options?.debounceMs ?? 500;

    // Clear existing timer for this key
    const existingTimer = debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounced timer
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        debounceTimers.delete(key);
      } catch (error) {
        console.error(`Error writing to localStorage (${key}):`, error);
      }
    }, debounceMs);

    debounceTimers.set(key, timer);
  },

  setImmediate<T = any>(key: StorageKey, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  },

  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};
