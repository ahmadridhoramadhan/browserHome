import React, { useState } from 'react';
import {
  Search,
  Plus,
  Palette,
  Sun,
  Moon,
} from 'lucide-react';
import { ThemeMode } from '../types';

interface TopBarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenWidgetCatalog: () => void;
  onOpenWallpaperModal: () => void;
  onResetLayout?: () => void;
  activeWidgetCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  theme,
  onToggleTheme,
  onOpenWidgetCatalog,
  onOpenWallpaperModal,
  activeWidgetCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEngine, setSearchEngine] = useState<'google' | 'duckduckgo' | 'bing' | 'youtube'>(
    'google',
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = encodeURIComponent(searchQuery.trim());
    let url = `https://www.google.com/search?q=${q}`;
    if (searchEngine === 'duckduckgo') url = `https://duckduckgo.com/?q=${q}`;
    if (searchEngine === 'bing') url = `https://www.bing.com/search?q=${q}`;
    if (searchEngine === 'youtube') url = `https://www.youtube.com/results?search_query=${q}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    setSearchQuery('');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 backdrop-blur-md bg-white/40 dark:bg-neutral-900/40 border-b border-white/20 dark:border-white/10 transition-colors duration-200">
      {/* Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-md sm:max-w-lg flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-neutral-800/80 border border-black/10 dark:border-white/10 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 transition-all"
      >
        <select
          value={searchEngine}
          onChange={(e) =>
            setSearchEngine(e.target.value as 'google' | 'duckduckgo' | 'bing' | 'youtube')
          }
          className="bg-transparent text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 focus:outline-none cursor-pointer pr-1"
        >
          <option value="google" className="bg-white dark:bg-neutral-800">
            Google
          </option>
          <option value="youtube" className="bg-white dark:bg-neutral-800">
            YouTube
          </option>
          <option value="duckduckgo" className="bg-white dark:bg-neutral-800">
            DuckDuckGo
          </option>
          <option value="bing" className="bg-white dark:bg-neutral-800">
            Bing
          </option>
        </select>

        <div className="h-3.5 w-px bg-neutral-300 dark:bg-neutral-700 mx-0.5" />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Telusuri dengan ${
            searchEngine === 'google'
              ? 'Google'
              : searchEngine === 'youtube'
              ? 'YouTube'
              : searchEngine === 'duckduckgo'
              ? 'DuckDuckGo'
              : 'Bing'
          }...`}
          className="w-full bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!searchQuery.trim()}
          title="Cari"
          className="p-1 rounded-full text-neutral-400 hover:text-blue-500 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Add Widget Button */}
        <button
          type="button"
          onClick={onOpenWidgetCatalog}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/60 dark:bg-neutral-800/60 hover:bg-white/90 dark:hover:bg-neutral-700/80 border border-black/5 dark:border-white/10 text-neutral-700 dark:text-neutral-200 transition-colors shadow-sm cursor-pointer"
          title="Buka / Tambah Widget"
        >
          <Plus className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-medium hidden md:inline">Tambah Widget</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
            {activeWidgetCount}
          </span>
        </button>

        {/* Wallpaper Settings */}
        <button
          type="button"
          onClick={onOpenWallpaperModal}
          title="Ganti Latar Belakang"
          className="p-2 rounded-lg bg-white/60 dark:bg-neutral-800/60 hover:bg-white/90 dark:hover:bg-neutral-700/80 border border-black/5 dark:border-white/10 text-neutral-700 dark:text-neutral-200 transition-colors shadow-sm cursor-pointer"
        >
          <Palette className="w-4 h-4 text-purple-500" />
        </button>

        {/* Dark / Light Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          className="p-2 rounded-lg bg-white/60 dark:bg-neutral-800/60 hover:bg-white/90 dark:hover:bg-neutral-700/80 border border-black/5 dark:border-white/10 text-neutral-700 dark:text-neutral-200 transition-colors shadow-sm cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>
      </div>
    </header>
  );
};
