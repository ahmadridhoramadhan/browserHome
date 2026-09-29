/**
 * Local 1-Month Shortcut Icon Cache
 * Requirements:
 * - Icons are cached locally for 1 month (30 days = 2,592,000,000 ms)
 * - Automatically refreshed when user opens the app if cache is older than 1 month
 * - Cache is strictly stored locally (in localStorage) to avoid Chrome cloud sync quota
 * - All icons are retrieved uniformly using standard web favicon services (no special hardcoded brand icons)
 */

import { ShortcutItem } from '../types';
import {
  getDomainFromUrl,
  getBaseDomainFromUrl,
  getOriginFromUrl,
} from './shortcutIconResolver';

export const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
export const SHORTCUT_ICON_CACHE_KEY = 'chrome_home_shortcut_icon_cache_v2';

export interface CachedIconEntry {
  iconUrl: string;
  cachedAt: number; // Timestamp when saved (Date.now())
  source: 'custom' | 'favicon' | 'fallback';
  url: string;
  stage?: number;
}

export type ShortcutIconCacheMap = Record<string, CachedIconEntry>;

/**
 * Load the local icon cache from localStorage
 */
export function getLocalIconCache(): ShortcutIconCacheMap {
  try {
    const raw = localStorage.getItem(SHORTCUT_ICON_CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ShortcutIconCacheMap;
  } catch (err) {
    console.warn('Failed to parse local shortcut icon cache:', err);
    return {};
  }
}

/**
 * Save icon cache to localStorage (local only, never synced)
 */
export function saveLocalIconCache(cache: ShortcutIconCacheMap): void {
  try {
    localStorage.setItem(SHORTCUT_ICON_CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn('Failed to persist local shortcut icon cache:', err);
  }
}

/**
 * Clean up expired icons (older than 1 month) or orphaned items
 */
export function pruneExpiredIconCache(): void {
  try {
    const cache = getLocalIconCache();
    const now = Date.now();
    let hasChanges = false;

    Object.keys(cache).forEach((id) => {
      const entry = cache[id];
      if (!entry || !entry.cachedAt) {
        delete cache[id];
        hasChanges = true;
        return;
      }
      // Retain entries for up to 35 days before hard garbage collection
      if (now - entry.cachedAt > ONE_MONTH_MS + 5 * 24 * 60 * 60 * 1000) {
        delete cache[id];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      saveLocalIconCache(cache);
    }
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Generate favicon source for any URL uniformly:
 * Stage 0: DuckDuckGo favicon API (extracts real icon from page tags, highly reliable for Bilibili, Google, etc.)
 * Stage 1: DuckDuckGo with base domain
 * Stage 2: Google S2 service with domain
 * Stage 3: Google S2 service with baseDomain
 * Stage 4: Direct origin /favicon.ico
 * Stage 5: Unavatar service
 */
export function generateFaviconUrl(url: string, stage: number = 0): string {
  const domain = getDomainFromUrl(url);
  const baseDomain = getBaseDomainFromUrl(url);
  const origin = getOriginFromUrl(url);

  switch (stage) {
    case 0:
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    case 1:
      return `https://icons.duckduckgo.com/ip3/${baseDomain}.ico`;
    case 2:
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    case 3:
      return `https://www.google.com/s2/favicons?domain=${baseDomain}&sz=128`;
    case 4:
      return `${origin}/favicon.ico`;
    default:
      return `https://icons.duckduckgo.com/ip3/${baseDomain}.ico`;
  }
}

/**
 * Resolve icon URL for a shortcut item uniformly:
 * 1. User custom icon in shortcutItem.icon
 * 2. Uniform Favicon for ALL sites (no hardcoded special brand icons)
 */
export function resolveIconForShortcut(
  shortcut: ShortcutItem,
  stage: number = 0,
): { iconUrl: string; source: CachedIconEntry['source'] } {
  // If this is a group folder without direct URL
  if (shortcut.isGroup || !shortcut.url) {
    return { iconUrl: '', source: 'fallback' };
  }

  // 1. Explicit user-provided icon
  if (shortcut.icon && shortcut.icon.trim()) {
    return { iconUrl: shortcut.icon.trim(), source: 'custom' };
  }

  // 2. Uniform Favicon Query (same for Bilibili, Google, YouTube, etc.)
  const faviconUrl = generateFaviconUrl(shortcut.url, stage);
  return { iconUrl: faviconUrl, source: 'favicon' };
}

/**
 * Get or refresh an icon for a shortcut, honoring the 1-month cache policy.
 * - If cached and age < 1 month: returns cached icon.
 * - If expired (age >= 1 month) or missing: refreshes icon, updates cache with new timestamp.
 */
export function getOrRefreshShortcutIcon(
  shortcut: ShortcutItem,
  forceRefresh: boolean = false,
  stage: number = 0,
): { iconUrl: string; isFromCache: boolean; isExpired: boolean; cachedAt: number } {
  const cache = getLocalIconCache();
  const cachedEntry = cache[shortcut.id];
  const now = Date.now();

  const isExpired = !cachedEntry || now - cachedEntry.cachedAt >= ONE_MONTH_MS;
  const isUrlChanged = cachedEntry && cachedEntry.url !== shortcut.url;

  // Use cached icon if valid, not forced, URL hasn't changed, and not from legacy brand special icon
  if (
    cachedEntry &&
    !isExpired &&
    !forceRefresh &&
    !isUrlChanged &&
    cachedEntry.source !== ('brand' as unknown) &&
    stage === (cachedEntry.stage || 0)
  ) {
    return {
      iconUrl: cachedEntry.iconUrl,
      isFromCache: true,
      isExpired: false,
      cachedAt: cachedEntry.cachedAt,
    };
  }

  // Refresh icon and store fresh timestamp (1-month validity begins now)
  const resolved = resolveIconForShortcut(shortcut, stage);
  cache[shortcut.id] = {
    iconUrl: resolved.iconUrl,
    cachedAt: now,
    source: resolved.source,
    url: shortcut.url,
    stage,
  };
  saveLocalIconCache(cache);

  return {
    iconUrl: resolved.iconUrl,
    isFromCache: false,
    isExpired: Boolean(isExpired),
    cachedAt: now,
  };
}

/**
 * Helper to recursively flatten shortcut items including items inside group folders
 */
export function flattenShortcutItems(shortcuts: ShortcutItem[]): ShortcutItem[] {
  const result: ShortcutItem[] = [];
  shortcuts.forEach((item) => {
    if (item.isGroup && Array.isArray(item.items)) {
      item.items.forEach((child) => result.push(child));
    } else if (!item.isGroup && item.url) {
      result.push(item);
    }
  });
  return result;
}

/**
 * Batch verification executed when user opens the app:
 * Refreshes any icons older than 1 month, returns map of [id -> iconUrl]
 */
export function checkAndRefreshAllShortcutIcons(
  shortcuts: ShortcutItem[],
  forceRefreshAll: boolean = false,
): { iconMap: Record<string, string>; refreshedCount: number } {
  const cache = getLocalIconCache();
  const now = Date.now();
  const iconMap: Record<string, string> = {};
  let refreshedCount = 0;
  let cacheUpdated = false;

  const flattened = flattenShortcutItems(shortcuts);

  flattened.forEach((shortcut) => {
    if (!shortcut.url) return;
    const entry = cache[shortcut.id];
    const isExpired = !entry || now - entry.cachedAt >= ONE_MONTH_MS;
    const isUrlChanged = entry && entry.url !== shortcut.url;
    const isLegacyBrand = entry && (entry.source as string) === 'brand';

    if (entry && !isExpired && !forceRefreshAll && !isUrlChanged && !isLegacyBrand) {
      iconMap[shortcut.id] = entry.iconUrl;
    } else {
      // Cache expired, legacy brand, or missing -> refresh upon opening
      const resolved = resolveIconForShortcut(shortcut, 0);
      cache[shortcut.id] = {
        iconUrl: resolved.iconUrl,
        cachedAt: now,
        source: resolved.source,
        url: shortcut.url,
        stage: 0,
      };
      iconMap[shortcut.id] = resolved.iconUrl;
      refreshedCount++;
      cacheUpdated = true;
    }
  });

  if (cacheUpdated) {
    saveLocalIconCache(cache);
  }

  return { iconMap, refreshedCount };
}

/**
 * Manually update the icon cache when an icon image error triggers stage fallback
 */
export function handleIconFailureFallback(
  shortcut: ShortcutItem,
  nextStage: number,
): string {
  const cache = getLocalIconCache();
  const resolved = resolveIconForShortcut(shortcut, nextStage);
  const now = Date.now();

  cache[shortcut.id] = {
    iconUrl: resolved.iconUrl,
    cachedAt: now,
    source: resolved.source,
    url: shortcut.url,
    stage: nextStage,
  };
  saveLocalIconCache(cache);

  return resolved.iconUrl;
}
