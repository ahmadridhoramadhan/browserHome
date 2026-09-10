export type ThemeMode = 'dark' | 'light';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CustomWidgetDef {
  id: string;
  title: string;
  icon: string;
  html: string;
  css: string;
  js: string;
  width: number;
  height: number;
  createdAt: number;
}

export interface WidgetState {
  id: string;
  type: 'clock' | 'weather' | 'todo' | 'prayer' | 'notes' | 'custom';
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  position: Position;
  zIndex: number;
  size?: Size;
  customId?: string;
}

export interface ShortcutItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  bgColor?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temp: number;
  feelsLike: number;
  condition: string;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  daily: Array<{
    day: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
  }>;
  lastUpdated: number;
}

export interface PrayerTime {
  name: string;
  label: string;
  time: string; // "04:32"
  timestamp: number; // today's epoch ms
  isNext?: boolean;
}

export interface PrayerData {
  city: string;
  latitude: number;
  longitude: number;
  times: PrayerTime[];
  nextPrayer: {
    name: string;
    label: string;
    time: string;
    remainingMinutes: number;
  } | null;
}

export interface BackgroundConfig {
  type: 'preset' | 'custom-url' | 'upload' | 'color' | 'gradient';
  value: string;
  blur: number; // 0, 4, 8, 12
  overlayOpacity: number; // 0 to 70 (%)
}
