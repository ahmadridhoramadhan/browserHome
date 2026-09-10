import { BackgroundConfig, ShortcutItem, ThemeMode, TodoItem, WidgetState } from '../types';

export const STORAGE_KEYS = {
  THEME: 'chrome_home_theme',
  WIDGETS: 'chrome_home_widgets',
  BACKGROUND: 'chrome_home_background',
  SHORTCUTS: 'chrome_home_shortcuts',
  SHORTCUTS_FOLDED: 'chrome_home_shortcuts_folded',
  TOPBAR_FOLDED: 'chrome_home_topbar_folded',
  CUSTOM_WIDGETS: 'chrome_home_custom_widgets',
  TODOS: 'chrome_home_todos',
  NOTES: 'chrome_home_notes',
  PRAYER_CITY: 'chrome_home_prayer_city',
  WEATHER_CITY: 'chrome_home_weather_city',
  SEARCH_ENGINE: 'chrome_home_search_engine',
  LAST_SYNC_UPLOAD: 'chrome_home_last_sync_upload',
  LAST_SYNC_DOWNLOAD: 'chrome_home_last_sync_download',
};

export const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  { id: '1', title: 'Google', url: 'https://www.google.com', bgColor: '#4285F4' },
  { id: '2', title: 'YouTube', url: 'https://www.youtube.com', bgColor: '#FF0000' },
  { id: '3', title: 'Gmail', url: 'https://mail.google.com', bgColor: '#EA4335' },
  { id: '4', title: 'GitHub', url: 'https://github.com', bgColor: '#24292e' },
  { id: '5', title: 'ChatGPT', url: 'https://chatgpt.com', bgColor: '#10A37F' },
  { id: '6', title: 'WhatsApp', url: 'https://web.whatsapp.com', bgColor: '#25D366' },
  { id: '7', title: 'Wikipedia', url: 'https://id.wikipedia.org', bgColor: '#333333' },
  { id: '8', title: 'Twitter / X', url: 'https://x.com', bgColor: '#000000' },
];

export const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: 'preset',
  value: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop', // Yosemite / Nature
  blur: 0,
  overlayOpacity: 25,
};

export const PRESET_WALLPAPERS = [
  {
    id: 'nature-1',
    name: 'Yosemite Mist',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'nature-2',
    name: 'Mount Fuji Dusk',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'cyber-1',
    name: 'Cyberpunk Neon',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'dark-minimal',
    name: 'Dark Horizon',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'aurora',
    name: 'Nordic Aurora',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'galaxy',
    name: 'Deep Space Stars',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'cozy-room',
    name: 'Warm Sunset Glow',
    url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=2000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'clean-architecture',
    name: 'Architectural Minimal',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&auto=format&fit=crop',
  },
];

export const PRESET_GRADIENTS = [
  'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
  'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%)',
  'linear-gradient(135deg, #4c0519 0%, #881337 50%, #4c0519 100%)',
  'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
  'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
];

export function getDefaultWidgets(windowWidth: number = 1280): WidgetState[] {
  // Compute initial layout nicely spaced across screen
  const isCompact = windowWidth < 1024;
  
  if (isCompact) {
    return [
      {
        id: 'clock',
        type: 'clock',
        title: 'Jam & Kalender',
        isOpen: true,
        isMinimized: false,
        position: { x: 20, y: 110 },
        zIndex: 10,
        size: { width: 340, height: 180 },
      },
      {
        id: 'weather',
        type: 'weather',
        title: 'Prakiraan Cuaca',
        isOpen: true,
        isMinimized: false,
        position: { x: 20, y: 310 },
        zIndex: 11,
        size: { width: 340, height: 260 },
      },
      {
        id: 'prayer',
        type: 'prayer',
        title: 'Jadwal Sholat',
        isOpen: true,
        isMinimized: false,
        position: { x: 20, y: 590 },
        zIndex: 12,
        size: { width: 340, height: 270 },
      },
      {
        id: 'todo',
        type: 'todo',
        title: 'Daftar Tugas Harian',
        isOpen: true,
        isMinimized: false,
        position: { x: 20, y: 880 },
        zIndex: 13,
        size: { width: 340, height: 350 },
      },
    ];
  }

  return [
    {
      id: 'clock',
      type: 'clock',
      title: 'Jam & Kalender',
      isOpen: true,
      isMinimized: false,
      position: { x: 40, y: 110 },
      zIndex: 10,
      size: { width: 360, height: 190 },
    },
    {
      id: 'weather',
      type: 'weather',
      title: 'Prakiraan Cuaca',
      isOpen: true,
      isMinimized: false,
      position: { x: 40, y: 320 },
      zIndex: 11,
      size: { width: 360, height: 275 },
    },
    {
      id: 'prayer',
      type: 'prayer',
      title: 'Jadwal Sholat',
      isOpen: true,
      isMinimized: false,
      position: { x: windowWidth - 420 > 440 ? windowWidth - 420 : 440, y: 110 },
      zIndex: 12,
      size: { width: 380, height: 285 },
    },
    {
      id: 'todo',
      type: 'todo',
      title: 'Daftar Tugas Harian',
      isOpen: true,
      isMinimized: false,
      position: { x: windowWidth - 420 > 440 ? windowWidth - 420 : 440, y: 415 },
      zIndex: 13,
      size: { width: 380, height: 360 },
    },
  ];
}

export function isChromeSyncAvailable(): boolean {
  try {
    return (
      typeof chrome !== 'undefined' &&
      Boolean(chrome?.storage?.sync) &&
      typeof chrome.storage.sync.get === 'function'
    );
  } catch {
    return false;
  }
}

type StorageListener = (value: unknown) => void;
const listeners = new Map<string, Set<StorageListener>>();

/**
 * Subscribe to changes for a specific storage key (both from local changes and remote sync)
 */
export function subscribeToStorage(key: string, listener: StorageListener): () => void {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)!.add(listener);

  return () => {
    listeners.get(key)?.delete(listener);
    if (listeners.get(key)?.size === 0) {
      listeners.delete(key);
    }
  };
}

function notifySubscribers(key: string, value: unknown) {
  const keyListeners = listeners.get(key);
  if (keyListeners) {
    keyListeners.forEach((fn) => {
      try {
        fn(value);
      } catch (err) {
        console.error(`Error in storage listener for ${key}:`, err);
      }
    });
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

/**
 * Save value to both localStorage (instant fast cache) and chrome.storage.sync (cross-device sync)
 */
export function saveToStorage<T>(key: string, value: T): void {
  // 1. Instant local persistence
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage:`, e);
  }

  // 2. Notify local component subscribers immediately
  notifySubscribers(key, value);

  // 3. Sync to Chrome Cloud Sync if running in Chrome Extension
  if (isChromeSyncAvailable()) {
    try {
      // Background uploads (Base64 data URLs) can exceed Chrome sync's 8KB per-item quota limit
      if (key === STORAGE_KEYS.BACKGROUND) {
        const bg = value as unknown as BackgroundConfig;
        if (bg && bg.type === 'upload' && bg.value && bg.value.length > 5000) {
          // Store the large file in chrome.storage.local instead
          if (chrome.storage?.local) {
            chrome.storage.local.set({ [key]: bg });
          }
          // In sync, keep the configuration (blur, overlay) without overflowing 8KB quota
          const syncMeta: BackgroundConfig = {
            ...bg,
            value: '', // Large upload stays local
          };
          chrome.storage.sync.set({ [key]: syncMeta }).catch((err) => {
            console.warn('Chrome sync error for background metadata:', err);
          });
          return;
        }
      }

      // Check serialized size against Chrome's 8KB per-item quota (8192 bytes limit)
      const serialized = JSON.stringify(value);
      if (serialized.length > 7800) {
        // Fallback to chrome.storage.local for oversized single items
        if (chrome.storage?.local) {
          chrome.storage.local.set({ [key]: value });
        }
        console.warn(`Item ${key} exceeds 8KB sync quota (${serialized.length} bytes), saved locally.`);
        return;
      }

      chrome.storage.sync.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          console.warn(`chrome.storage.sync error saving ${key}:`, chrome.runtime.lastError.message);
        } else {
          try {
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC_UPLOAD, JSON.stringify(new Date().toISOString()));
          } catch {
            // ignore
          }
        }
      });
    } catch (e) {
      console.warn(`Failed to push ${key} to chrome.storage.sync:`, e);
    }
  }
}

export interface SyncResult {
  success: boolean;
  message: string;
  itemCount: number;
  timestamp: string;
  keys?: string[];
}

/**
 * Explicitly pulls/downloads the latest settings from Chrome Cloud Sync
 * and updates localStorage & all component subscribers immediately.
 */
export function pullSettingsFromChromeSync(): Promise<SyncResult> {
  return new Promise((resolve) => {
    if (!isChromeSyncAvailable()) {
      resolve({
        success: false,
        message: 'Chrome Cloud Sync hanya tersedia saat dipasang sebagai ekstensi Chrome.',
        itemCount: 0,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    chrome.storage.sync.get(null, (items) => {
      if (chrome.runtime.lastError) {
        resolve({
          success: false,
          message: `Gagal membaca dari Chrome Sync: ${chrome.runtime.lastError.message}`,
          itemCount: 0,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!items || typeof items !== 'object' || Object.keys(items).length === 0) {
        resolve({
          success: false,
          message: 'Belum ada data pengaturan yang tersimpan di Chrome Sync akun ini.',
          itemCount: 0,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const validKeys = Object.values(STORAGE_KEYS);
      const appliedKeys: string[] = [];

      Object.entries(items).forEach(([key, value]) => {
        if (validKeys.includes(key) && value !== undefined && value !== null) {
          if (key === STORAGE_KEYS.BACKGROUND) {
            const currentLocal = loadFromStorage<BackgroundConfig | null>(STORAGE_KEYS.BACKGROUND, null);
            const remoteBg = value as BackgroundConfig;
            if (remoteBg.type === 'upload' && !remoteBg.value && currentLocal?.value) {
              remoteBg.value = currentLocal.value;
            }
          }

          try {
            localStorage.setItem(key, JSON.stringify(value));
            notifySubscribers(key, value);
            appliedKeys.push(key);
          } catch (e) {
            console.warn(`Error applying synced key ${key}:`, e);
          }
        }
      });

      const now = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC_DOWNLOAD, JSON.stringify(now));
      } catch {
        // ignore
      }

      resolve({
        success: true,
        message: `Berhasil mengunduh ${appliedKeys.length} pengaturan terbaru dari Chrome Sync!`,
        itemCount: appliedKeys.length,
        timestamp: now,
        keys: appliedKeys,
      });
    });
  });
}

/**
 * Explicitly pushes/uploads all local configurations to Chrome Cloud Sync
 */
export function pushSettingsToChromeSync(): Promise<SyncResult> {
  return new Promise((resolve) => {
    if (!isChromeSyncAvailable()) {
      resolve({
        success: false,
        message: 'Chrome Cloud Sync hanya tersedia saat dipasang sebagai ekstensi Chrome.',
        itemCount: 0,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const payload: Record<string, unknown> = {};
    const excludedKeys = [STORAGE_KEYS.LAST_SYNC_UPLOAD, STORAGE_KEYS.LAST_SYNC_DOWNLOAD];
    const validKeys = Object.values(STORAGE_KEYS).filter((k) => !excludedKeys.includes(k));

    let count = 0;
    validKeys.forEach((key) => {
      const val = localStorage.getItem(key);
      if (val !== null) {
        try {
          const parsed = JSON.parse(val);
          if (key === STORAGE_KEYS.BACKGROUND && parsed && parsed.type === 'upload' && parsed.value?.length > 5000) {
            payload[key] = { ...parsed, value: '' };
            count++;
          } else {
            const serialized = JSON.stringify(parsed);
            if (serialized.length <= 7800) {
              payload[key] = parsed;
              count++;
            }
          }
        } catch {
          // ignore
        }
      }
    });

    chrome.storage.sync.set(payload, () => {
      if (chrome.runtime.lastError) {
        resolve({
          success: false,
          message: `Gagal mengunggah ke Chrome Sync: ${chrome.runtime.lastError.message}`,
          itemCount: 0,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const now = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC_UPLOAD, JSON.stringify(now));
      } catch {
        // ignore
      }

      resolve({
        success: true,
        message: `Berhasil mengunggah ${count} pengaturan ke Chrome Sync akun Anda!`,
        itemCount: count,
        timestamp: now,
      });
    });
  });
}

/**
 * Get timestamps of last upload and last download
 */
export function getLastSyncTimes(): { upload: string | null; download: string | null } {
  const upload = loadFromStorage<string | null>(STORAGE_KEYS.LAST_SYNC_UPLOAD, null);
  const download = loadFromStorage<string | null>(STORAGE_KEYS.LAST_SYNC_DOWNLOAD, null);
  return { upload, download };
}

/**
 * Initialize Chrome Storage Sync on app startup.
 * Loads remote synced values from Chrome and listens to real-time changes across devices.
 */
export function initStorageSync(onRemoteUpdate?: (key: string, value: unknown) => void): () => void {
  if (!isChromeSyncAvailable()) {
    return () => {};
  }

  // A. Initial load of all synced data from Chrome Cloud
  chrome.storage.sync.get(null, (items) => {
    if (chrome.runtime.lastError) {
      console.warn('Error reading from chrome.storage.sync:', chrome.runtime.lastError.message);
      return;
    }

    if (items && typeof items === 'object') {
      Object.entries(items).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // If this is background and value was truncated due to quota, keep local upload if present
          if (key === STORAGE_KEYS.BACKGROUND) {
            const currentLocal = loadFromStorage<BackgroundConfig | null>(STORAGE_KEYS.BACKGROUND, null);
            const remoteBg = value as BackgroundConfig;
            if (remoteBg.type === 'upload' && !remoteBg.value && currentLocal?.value) {
              remoteBg.value = currentLocal.value;
            }
          }

          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch {
            // ignore
          }
          notifySubscribers(key, value);
          if (onRemoteUpdate) {
            onRemoteUpdate(key, value);
          }
        }
      });
      try {
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC_DOWNLOAD, JSON.stringify(new Date().toISOString()));
      } catch {
        // ignore
      }
    }
  });

  // B. Listen for real-time changes made on other devices or other tabs
  const changeListener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string,
  ) => {
    if (areaName !== 'sync') return;

    Object.entries(changes).forEach(([key, change]) => {
      if (change.newValue !== undefined) {
        try {
          localStorage.setItem(key, JSON.stringify(change.newValue));
        } catch {
          // ignore
        }
        notifySubscribers(key, change.newValue);
        if (onRemoteUpdate) {
          onRemoteUpdate(key, change.newValue);
        }
      } else if (change.oldValue !== undefined && change.newValue === undefined) {
        try {
          localStorage.removeItem(key);
        } catch {
          // ignore
        }
      }
    });
  };

  chrome.storage.onChanged.addListener(changeListener);

  return () => {
    try {
      chrome.storage.onChanged.removeListener(changeListener);
    } catch {
      // ignore
    }
  };
}

/**
 * Export all user configurations as a JSON string for offline backup or manual transfer
 */
export function exportAllSettings(): string {
  const exportData: Record<string, unknown> = {};
  Object.values(STORAGE_KEYS).forEach((key) => {
    const val = localStorage.getItem(key);
    if (val !== null) {
      try {
        exportData[key] = JSON.parse(val);
      } catch {
        exportData[key] = val;
      }
    }
  });
  return JSON.stringify({
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: exportData,
  }, null, 2);
}

/**
 * Import configurations from a JSON string
 */
export function importAllSettings(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    const data = parsed.data || parsed;
    if (typeof data !== 'object' || data === null) return false;

    Object.entries(data).forEach(([key, val]) => {
      if (Object.values(STORAGE_KEYS).includes(key)) {
        saveToStorage(key, val);
      }
    });
    return true;
  } catch (err) {
    console.error('Failed to import settings:', err);
    return false;
  }
}
