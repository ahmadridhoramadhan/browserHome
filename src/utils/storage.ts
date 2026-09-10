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

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage:`, e);
  }
}
