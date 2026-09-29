/**
 * Domain & URL Utilities for Shortcut Icons
 * Uniformly extracts hostname and base domains for favicon resolution.
 * All shortcuts (Google, YouTube, Bilibili, etc.) are treated equally
 * using the standard web favicon services.
 */

/**
 * Clean and parse URL hostname (e.g. "www.bilibili.tv" from "https://www.bilibili.tv/id/timeline")
 */
export function getDomainFromUrl(rawUrl: string): string {
  try {
    const clean = rawUrl.trim().replace(/^http:\/\//i, 'https://');
    const parsed = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
    return parsed.hostname.toLowerCase();
  } catch {
    const withoutProtocol = rawUrl.trim().toLowerCase().replace(/^https?:\/\//i, '');
    return withoutProtocol.split('/')[0].split('?')[0];
  }
}

/**
 * Extract base domain by removing common prefixes like "www." or "m."
 * (e.g. "bilibili.tv" from "www.bilibili.tv")
 */
export function getBaseDomainFromUrl(rawUrl: string): string {
  const domain = getDomainFromUrl(rawUrl);
  return domain.replace(/^(www\.|m\.)/i, '');
}

/**
 * Extract website origin (e.g. "https://www.bilibili.tv")
 */
export function getOriginFromUrl(rawUrl: string): string {
  try {
    const clean = rawUrl.trim().replace(/^http:\/\//i, 'https://');
    const parsed = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
    return parsed.origin;
  } catch {
    const domain = getDomainFromUrl(rawUrl);
    return `https://${domain}`;
  }
}
