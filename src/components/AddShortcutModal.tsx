import React, { useState, useEffect } from 'react';
import { X, Globe, Plus, Check } from 'lucide-react';
import { ShortcutItem } from '../types';
import { resolveIconForShortcut } from '../utils/shortcutIconCache';

interface AddShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (shortcut: ShortcutItem) => void;
  editingShortcut?: ShortcutItem | null;
  onUpdate?: (shortcut: ShortcutItem) => void;
}

export const AddShortcutModal: React.FC<AddShortcutModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  editingShortcut,
  onUpdate,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [customIcon, setCustomIcon] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bgColor, setBgColor] = useState('');

  useEffect(() => {
    if (editingShortcut) {
      setTitle(editingShortcut.title || '');
      setUrl(editingShortcut.url || '');
      setCustomIcon(editingShortcut.icon || '');
      setBgColor(editingShortcut.bgColor || '');
      setShowAdvanced(Boolean(editingShortcut.icon || editingShortcut.bgColor));
    } else {
      setTitle('');
      setUrl('');
      setCustomIcon('');
      setBgColor('');
      setShowAdvanced(false);
    }
  }, [editingShortcut, isOpen]);

  if (!isOpen) return null;

  // Live preview calculation
  const cleanUrl = url.trim().length > 0
    ? (url.trim().startsWith('http://') || url.trim().startsWith('https://') ? url.trim() : `https://${url.trim()}`)
    : 'https://google.com';

  const previewShortcut: ShortcutItem = {
    id: editingShortcut ? editingShortcut.id : 'preview',
    title: title.trim() || 'Aplikasi',
    url: cleanUrl,
    icon: customIcon.trim() || undefined,
  };

  const resolvedPreview = resolveIconForShortcut(previewShortcut, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    if (editingShortcut && onUpdate) {
      onUpdate({
        ...editingShortcut,
        title: title.trim(),
        url: finalUrl,
        icon: customIcon.trim() || undefined,
        bgColor: bgColor.trim() || undefined,
      });
    } else {
      const newShortcut: ShortcutItem = {
        id: String(Date.now()),
        title: title.trim(),
        url: finalUrl,
        icon: customIcon.trim() || undefined,
        bgColor: bgColor.trim() || undefined,
      };
      onAdd(newShortcut);
    }

    setTitle('');
    setUrl('');
    setCustomIcon('');
    setBgColor('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2 font-semibold text-sm text-neutral-800 dark:text-neutral-100">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>{editingShortcut ? 'Edit Pintasan Aplikasi' : 'Tambah Pintasan Aplikasi'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Icon Preview Banner */}
        <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/40 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md bg-white/90 dark:bg-neutral-800/90 border border-black/5 dark:border-white/10 overflow-hidden shrink-0 transition-transform duration-200"
            style={bgColor ? { backgroundColor: bgColor } : undefined}
          >
            <img
              src={resolvedPreview.iconUrl}
              alt="Icon preview"
              className="w-7 h-7 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // If preview fails, show fallback letter
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
              {title.trim() || 'Pratinjau Icon'}
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
              Favicon situs otomatis
            </span>
          </div>
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
              placeholder="Contoh: Google Vids, Google Pics, GitHub"
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
              placeholder="Contoh: vids.google.com atau photos.google.com"
              className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Advanced toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{showAdvanced ? '− Sembunyikan Opsi Lanjutan' : '+ Opsi Icon & Warna Kustom'}</span>
            </button>
          </div>

          {showAdvanced && (
            <div className="flex flex-col gap-2.5 p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-neutral-200 dark:border-neutral-800 animate-in fade-in duration-100">
              <div>
                <label className="block mb-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                  URL Icon Kustom (Opsional)
                </label>
                <input
                  type="text"
                  value={customIcon}
                  onChange={(e) => setCustomIcon(e.target.value)}
                  placeholder="https://.../icon.png"
                  className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                  Warna Latar Belakang Kotak (Opsional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor || '#ffffff'}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    placeholder="#ffffff atau biarkan default"
                    className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {editingShortcut ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Simpan Pintasan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
