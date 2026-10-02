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
export const SHORTCUT_ICON_CACHE_KEY = 'chrome_home_shortcut_icon_cache_v5';

export interface CachedIconEntry {
  iconUrl: string;
  cachedAt: number; // Timestamp when saved (Date.now())
  source: 'custom' | 'favicon' | 'fallback';
  url: string;
  stage?: number;
}

export type ShortcutIconCacheMap = Record<string, CachedIconEntry>;

/**
 * Check if a URL belongs to a broken service (DuckDuckGo SSL error in ID)
 * or obsolete Google S2 (which flattens all subdomains into a generic root logo or returns broken globes).
 */
export function isOutdatedOrBrokenIconUrl(url?: string): boolean {
  if (!url) return true;
  return url.includes('duckduckgo.com') || url.includes('/s2/favicons');
}

/**
 * Normalize any input URL into a full URL with scheme for favicon querying
 */
export function normalizeUrlForFavicon(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Generate a clean inline SVG Data URL with the initial letter of the website/title
 * Used as the ultimate offline/fallback icon so users never see broken images.
 */
export function generateLetterFallbackIcon(title: string, domain: string): string {
  const char = (title || domain || '?').trim().charAt(0).toUpperCase();
  let hash = 0;
  const str = domain || title || 'app';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [210, 220, 260, 280, 330, 350, 25, 45, 140, 160, 180];
  const hue = hues[Math.abs(hash) % hues.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <rect width="64" height="64" rx="14" fill="hsl(${hue}, 65%, 45%)"/>
    <text x="32" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="bold" fill="#ffffff" text-anchor="middle">${char}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Load the local icon cache from localStorage
 */
export function getLocalIconCache(): ShortcutIconCacheMap {
  try {
    // Clean old caches if present
    if (typeof window !== 'undefined' && window.localStorage) {
      ['chrome_home_shortcut_icon_cache_v1', 'chrome_home_shortcut_icon_cache_v2', 'chrome_home_shortcut_icon_cache_v3', 'chrome_home_shortcut_icon_cache_v4'].forEach((oldKey) => {
        const oldVal = localStorage.getItem(oldKey);
        if (oldVal) {
          try {
            const parsed = JSON.parse(oldVal) as ShortcutIconCacheMap;
            const current = localStorage.getItem(SHORTCUT_ICON_CACHE_KEY);
            if (!current && parsed && typeof parsed === 'object') {
              const migrated: ShortcutIconCacheMap = {};
              Object.keys(parsed).forEach((k) => {
                const item = parsed[k];
                if (item && item.iconUrl && !isOutdatedOrBrokenIconUrl(item.iconUrl)) {
                  migrated[k] = item;
                }
              });
              localStorage.setItem(SHORTCUT_ICON_CACHE_KEY, JSON.stringify(migrated));
            }
          } catch {
            // ignore migration parse error
          }
          localStorage.removeItem(oldKey);
        }
      });
    }

    const raw = localStorage.getItem(SHORTCUT_ICON_CACHE_KEY);
    if (!raw) return {};
    const cache = JSON.parse(raw) as ShortcutIconCacheMap;

    // Purge any outdated or broken URLs that may have been cached
    let hasPurged = false;
    Object.keys(cache).forEach((id) => {
      if (isOutdatedOrBrokenIconUrl(cache[id]?.iconUrl)) {
        delete cache[id];
        hasPurged = true;
      }
    });
    if (hasPurged) {
      localStorage.setItem(SHORTCUT_ICON_CACHE_KEY, JSON.stringify(cache));
    }

    return cache;
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
      if (!entry || !entry.cachedAt || isOutdatedOrBrokenIconUrl(entry.iconUrl)) {
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
 * Stage 0: Unavatar HTML-crawler with Google Chromium Favicon V2 fallback (extracts actual <link rel="icon"> from page source, resolving complex video/app sites like Bstation, WhatsApp, etc.)
 * Stage 1: Google Chromium Favicon V2 with FULL URL (extracts specific icons for subdomains like docs, drive, mail, stitch, in 128px high-res)
 * Stage 2: Google Chromium Favicon V2 with Origin (e.g. https://web.whatsapp.com or https://www.bilibili.tv)
 * Stage 3: Direct origin /favicon.ico
 * Stage 4: Icon Horse high-resolution CDN
 * Stage 5+: Clean SVG letter fallback
 */
export function generateFaviconUrl(url: string, stage: number = 0): string {
  const normalizedUrl = normalizeUrlForFavicon(url);
  const domain = getDomainFromUrl(url);
  const baseDomain = getBaseDomainFromUrl(url);
  const origin = getOriginFromUrl(url);

  const googleV2Full = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(normalizedUrl)}&size=128`;

  switch (stage) {
    case 0:
      // Stage 0: Real HTML <link rel="icon"> resolver via unavatar with Google V2 fallback
      return `https://unavatar.io/${domain}?fallback=${encodeURIComponent(googleV2Full)}`;
    case 1:
      // Stage 1: Direct Google Chromium Favicon V2 with full URL (docs, drive, mail, etc.)
      return googleV2Full;
    case 2:
      // Stage 2: Direct Google Chromium Favicon V2 with origin
      return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(origin)}&size=128`;
    case 3:
      // Stage 3: Direct origin /favicon.ico
      return `${origin}/favicon.ico`;
    case 4:
      // Stage 4: Icon Horse CDN
      return `https://icon.horse/icon/${encodeURIComponent(domain)}`;
    case 5:
      // Stage 5: Google Chromium Favicon V2 with Base Domain
      return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent('https://' + baseDomain)}&size=128`;
    default:
      return googleV2Full;
  }
}

/**
 * Resolve icon URL for a shortcut item uniformly:
 * 1. User custom icon in shortcutItem.icon
 * 2. Uniform Favicon for ALL sites (fair, unbiased, no hardcoded special brand icons)
 * 3. Graceful SVG Letter Fallback if online stages fail
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

  // 2. Beyond stage 5 -> return local SVG Letter fallback (no network failure possible)
  if (stage >= 6) {
    const domain = getDomainFromUrl(shortcut.url);
    return {
      iconUrl: generateLetterFallbackIcon(shortcut.title, domain),
      source: 'fallback',
    };
  }

  // 3. Uniform Favicon Query
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
  const isInvalid = cachedEntry && isOutdatedOrBrokenIconUrl(cachedEntry.iconUrl);

  // Use cached icon if valid, not forced, URL hasn't changed, and not invalid service
  if (
    cachedEntry &&
    !isExpired &&
    !forceRefresh &&
    !isUrlChanged &&
    !isInvalid &&
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
    url: shortcut.url || '',
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
    const isInvalidService = entry && isOutdatedOrBrokenIconUrl(entry.iconUrl);

    if (entry && !isExpired && !forceRefreshAll && !isUrlChanged && !isLegacyBrand && !isInvalidService) {
      iconMap[shortcut.id] = entry.iconUrl;
    } else {
      // Cache expired, legacy brand, invalid service, or missing -> refresh upon opening
      const resolved = resolveIconForShortcut(shortcut, 0);
      cache[shortcut.id] = {
        iconUrl: resolved.iconUrl,
        cachedAt: now,
        source: resolved.source,
        url: shortcut.url || '',
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
    url: shortcut.url || '',
    stage: nextStage,
  };
  saveLocalIconCache(cache);

  return resolved.iconUrl;
}
