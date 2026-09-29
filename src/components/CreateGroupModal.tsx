import React, { useState } from 'react';
import { X, FolderPlus, Check } from 'lucide-react';
import { ShortcutItem } from '../types';
import { getOrRefreshShortcutIcon } from '../utils/shortcutIconCache';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableShortcuts: ShortcutItem[];
  onCreateGroup: (groupTitle: string, selectedShortcutIds: string[]) => void;
  iconMap: Record<string, string>;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  availableShortcuts,
  onCreateGroup,
  iconMap,
}) => {
  const [title, setTitle] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  // Filter out any shortcuts that are already groups
  const singleShortcuts = availableShortcuts.filter((s) => !s.isGroup);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateGroup(title.trim(), selectedIds);
    setTitle('');
    setSelectedIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2 font-semibold text-sm text-neutral-800 dark:text-neutral-100">
            <FolderPlus className="w-4 h-4 text-blue-500" />
            <span>Buat Grup Pintasan Baru</span>
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
              Nama Grup / Folder
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Google Apps, Media, Pekerjaan"
              className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {singleShortcuts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-medium text-neutral-700 dark:text-neutral-300">
                  Pilih Aplikasi untuk Dimasukkan
                </label>
                <span className="text-[11px] text-neutral-500">
                  {selectedIds.length} dipilih
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-1 custom-shortcut-scrollbar">
                {singleShortcuts.map((s) => {
                  const isSelected = selectedIds.includes(s.id);
                  const iconSrc = iconMap[s.id] || getOrRefreshShortcutIcon(s, false, 0).iconUrl;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSelect(s.id)}
                      className={`flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/90 dark:bg-neutral-800/90 shadow-xs border border-black/5 dark:border-white/10 overflow-hidden shrink-0">
                          <img
                            src={iconSrc}
                            alt={s.title}
                            className="w-4 h-4 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="truncate text-xs font-medium">{s.title}</span>
                      </div>

                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-neutral-400 dark:border-neutral-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                    </button>
                  );
                })}
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
              disabled={!title.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Buat Grup</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
