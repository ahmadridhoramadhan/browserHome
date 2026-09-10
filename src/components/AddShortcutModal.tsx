import React, { useState } from 'react';
import { X, Globe, Plus } from 'lucide-react';
import { ShortcutItem } from '../types';

interface AddShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (shortcut: ShortcutItem) => void;
}

export const AddShortcutModal: React.FC<AddShortcutModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const newShortcut: ShortcutItem = {
      id: String(Date.now()),
      title: title.trim(),
      url: cleanUrl,
    };

    onAdd(newShortcut);
    setTitle('');
    setUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2 font-semibold text-sm text-neutral-800 dark:text-neutral-100">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Tambah Pintasan Aplikasi</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3 text-xs">
          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
              Nama Aplikasi / Situs
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: GitHub, Figma, Spotify"
              className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
              URL Situs Web
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Contoh: https://github.com"
              className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !url.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simpan Pintasan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
