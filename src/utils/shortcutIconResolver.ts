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

/**
 * Strips user session identifiers (like /u/0/, /u/1/, /b/0/, or authuser=0)
 * to get the canonical public service route suitable for crawlers and sub-service detection.
 */
export function stripUserSessionFromUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  return rawUrl
    .replace(/\/u\/[0-9]+(\/|$)/g, '/')
    .replace(/\/b\/[0-9]+(\/|$)/g, '/')
    .replace(/([?&])authuser=[0-9]+&?/g, '$1')
    .replace(/[?&]$/, '');
}

/**
 * Detect sub-service / suite product icons when multiple products reside under pathnames
 * of the same domain (e.g. Google Docs/Sheets/Slides/Forms/Vids, Office 365 apps, etc.)
 */
export function resolveSubServiceIcon(url: string): string | null {
  try {
    const clean = url.trim().replace(/^http:\/\//i, 'https://');
    const parsed = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
    const host = parsed.hostname.toLowerCase();
    const segments = parsed.pathname
      .toLowerCase()
      .split('/')
      .filter((s) => s && s !== 'u' && !/^[0-9]+$/.test(s));

    if (segments.length === 0) return null;
    const firstSegment = segments[0];

    // Google Workspace suite under docs.google.com or drive.google.com
    if (host.includes('docs.google.com') || host.includes('workspace.google.com') || host.includes('drive.google.com')) {
      const googleWorkspaceMap: Record<string, string> = {
        videos: 'https://www.gstatic.com/images/branding/productlogos/vids_2026/v2/ico/vids_2026_64dp.ico',
        vids: 'https://www.gstatic.com/images/branding/productlogos/vids_2026/v2/ico/vids_2026_64dp.ico',
        document: 'https://www.gstatic.com/images/branding/productlogos/docs_2026/v2/ico/docs_2026_64dp.ico',
        docs: 'https://www.gstatic.com/images/branding/productlogos/docs_2026/v2/ico/docs_2026_64dp.ico',
        spreadsheets: 'https://www.gstatic.com/images/branding/productlogos/sheets_2026/v2/ico/sheets_2026_64dp.ico',
        sheets: 'https://www.gstatic.com/images/branding/productlogos/sheets_2026/v2/ico/sheets_2026_64dp.ico',
        presentation: 'https://www.gstatic.com/images/branding/productlogos/slides_2026/v2/ico/slides_2026_64dp.ico',
        slides: 'https://www.gstatic.com/images/branding/productlogos/slides_2026/v2/ico/slides_2026_64dp.ico',
        forms: 'https://www.gstatic.com/images/branding/productlogos/forms_2026/v2/ico/forms_2026_64dp.ico',
        drawings: 'https://www.gstatic.com/images/branding/productlogos/drawings_2026/v2/ico/drawings_2026_64dp.ico',
      };
      if (googleWorkspaceMap[firstSegment]) {
        return googleWorkspaceMap[firstSegment];
      }
    }

    // Microsoft 365 web apps under office.com / live.com
    if (host.includes('office.com') || host.includes('live.com') || host.includes('microsoft365.com')) {
      const officeMap: Record<string, string> = {
        word: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/word_48x1.svg',
        excel: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/excel_48x1.svg',
        powerpoint: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/powerpoint_48x1.svg',
        onenote: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/onenote_48x1.svg',
        teams: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/teams_48x1.svg',
      };
      for (const seg of segments) {
        if (officeMap[seg]) return officeMap[seg];
      }
    }

    return null;
  } catch {
    return null;
  }
}
