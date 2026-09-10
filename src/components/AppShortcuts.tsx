import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
  GripVertical,
} from 'lucide-react';
import { ShortcutItem } from '../types';
import { AddShortcutModal } from './AddShortcutModal';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

interface AppShortcutsProps {
  shortcuts: ShortcutItem[];
  onAddShortcut: (shortcut: ShortcutItem) => void;
  onRemoveShortcut: (id: string) => void;
  onReorderShortcuts: (shortcuts: ShortcutItem[]) => void;
}

export const AppShortcuts: React.FC<AppShortcutsProps> = ({
  shortcuts,
  onAddShortcut,
  onRemoveShortcut,
  onReorderShortcuts,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [failedFaviconStages, setFailedFaviconStages] = useState<Record<string, number>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Edit mode toggle state
  const [isEditing, setIsEditing] = useState(false);

  // Foldable state (persisted in localStorage)
  const [isFolded, setIsFolded] = useState<boolean>(() => {
    return loadFromStorage<boolean>(STORAGE_KEYS.SHORTCUTS_FOLDED, false);
  });

  // Drag & drop state for reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleToggleFold = (folded: boolean) => {
    setIsFolded(folded);
    saveToStorage(STORAGE_KEYS.SHORTCUTS_FOLDED, folded);
    if (folded && isEditing) {
      setIsEditing(false);
    }
  };

  const getDomain = (url: string) => {
    try {
      const cleanUrl = url.trim().replace(/^http:\/\//i, 'https://');
      const parsed = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
      const hostname = parsed.hostname.toLowerCase();
      // For WhatsApp and similar subdomains, the root domain is reliable with favicon services
      if (hostname.endsWith('whatsapp.com')) {
        return 'whatsapp.com';
      }
      return hostname;
    } catch {
      return url;
    }
  };

  const getFaviconUrl = (url: string, stage: number = 0) => {
    const domain = getDomain(url);
    if (stage === 1) {
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    }
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  };

  const handleImageError = (id: string) => {
    setFailedFaviconStages((prev) => {
      const currentStage = prev[id] || 0;
      return { ...prev, [id]: currentStage + 1 };
    });
  };

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 2;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shortcuts, isFolded, checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 240;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // If horizontal or vertical wheel, scroll horizontally
    if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
      el.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  // Reorder shortcuts using arrow buttons
  const moveShortcut = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= shortcuts.length) return;
    const reordered = [...shortcuts];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);
    onReorderShortcuts(reordered);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isEditing) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isEditing) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (!isEditing) return;
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...shortcuts];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);
    onReorderShortcuts(reordered);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <>
      <div className="flex flex-col items-center select-none w-full max-w-4xl mx-auto px-4 z-20">
        {/* FOLDED STATE (Minimalist Bottom Pull-up Pill) */}
        {isFolded ? (
          <button
            type="button"
            onClick={() => handleToggleFold(false)}
            title="Tampilkan Pintasan Aplikasi (Expand)"
            className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/75 dark:bg-neutral-900/80 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-white/95 dark:hover:bg-neutral-800/95 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronUp className="w-4 h-4 text-blue-500 group-hover:-translate-y-0.5 transition-transform" />
            <span>Pintasan</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400">
              {shortcuts.length}
            </span>
          </button>
        ) : (
          /* EXPANDED SHORTCUTS DOCK */
          <div className="relative w-full max-w-2xl sm:max-w-3xl flex flex-col rounded-2xl bg-white/45 dark:bg-neutral-900/50 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-xl transition-all duration-300">
            {/* Dock Header: Title, Edit Toggle & Fold Down Button */}
            <div className="flex items-center justify-between px-3 pt-2 pb-1 text-xs border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Pintasan
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400">
                  {shortcuts.length}
                </span>

                {isEditing && (
                  <span className="text-[11px] font-normal text-blue-600 dark:text-blue-400 animate-pulse ml-1 hidden sm:inline">
                    Tarik atau klik panah untuk atur urutan
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Toggle Edit Button */}
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  title={isEditing ? 'Selesai mengatur pintasan' : 'Atur urutan & kelola pintasan'}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isEditing
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Selesai</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Atur</span>
                    </>
                  )}
                </button>

                {/* Fold to Bottom Button */}
                <button
                  type="button"
                  onClick={() => handleToggleFold(true)}
                  title="Lipat ke bawah (Sembunyikan)"
                  aria-label="Lipat ke bawah"
                  className="p-1 rounded-lg text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Container with Arrows */}
            <div className="relative w-full flex items-center p-1.5 sm:p-2">
              {/* Scroll Left Button */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  title="Gulir ke kiri"
                  aria-label="Gulir ke kiri"
                  className="absolute -left-3 sm:-left-3.5 z-30 p-1.5 rounded-full bg-white/95 dark:bg-neutral-800/95 shadow-md border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:scale-110 active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Horizontal Single-Row Scrolling Shortcuts Dock */}
              <div
                ref={scrollContainerRef}
                onWheel={handleWheel}
                onScroll={checkScroll}
                className="w-full flex flex-row items-center flex-nowrap overflow-x-auto gap-2.5 sm:gap-3 p-1.5 custom-shortcut-scrollbar scroll-smooth"
              >
                {shortcuts.map((shortcut, index) => {
                  const stage = failedFaviconStages[shortcut.id] || 0;
                  const hasFailed = stage >= 2;
                  const isBeingDragged = draggedIndex === index;
                  const isDropTarget = dragOverIndex === index && draggedIndex !== index;

                  return (
                    <div
                      key={shortcut.id}
                      draggable={isEditing}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`group relative flex flex-col items-center shrink-0 rounded-xl transition-all duration-200 ${
                        isBeingDragged ? 'opacity-40 scale-95' : ''
                      } ${
                        isDropTarget
                          ? 'ring-2 ring-blue-500 bg-blue-500/10 scale-105'
                          : ''
                      } ${
                        isEditing
                          ? 'cursor-grab active:cursor-grabbing p-1 bg-black/5 dark:bg-white/5 border border-dashed border-neutral-300 dark:border-neutral-700'
                          : ''
                      }`}
                    >
                      {/* Delete Button (ONLY visible when isEditing === true) */}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onRemoveShortcut(shortcut.id);
                          }}
                          title={`Hapus ${shortcut.title}`}
                          className="absolute -top-1 -right-1 z-30 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transform hover:scale-110 transition-all duration-150 cursor-pointer"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      )}

                      {/* Drag Handle Indicator in Edit Mode */}
                      {isEditing && (
                        <div
                          className="absolute top-1 left-1 z-20 text-neutral-400 dark:text-neutral-500 pointer-events-none"
                          title="Tarik untuk memindahkan"
                        >
                          <GripVertical className="w-3 h-3" />
                        </div>
                      )}

                      {/* Shortcut Link or Tile */}
                      <a
                        href={isEditing ? undefined : shortcut.url}
                        target={isEditing ? undefined : '_self'}
                        onClick={(e) => {
                          if (isEditing) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        className={`flex flex-col items-center gap-1.5 p-1 sm:p-1.5 rounded-xl transition-all duration-200 w-16 sm:w-20 ${
                          !isEditing
                            ? 'hover:bg-white/60 dark:hover:bg-neutral-800/70 group-hover:-translate-y-1'
                            : 'pointer-events-none'
                        }`}
                      >
                        <div
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-md border border-black/5 dark:border-white/10 overflow-hidden transition-transform duration-200 group-hover:scale-105"
                          style={{ backgroundColor: shortcut.bgColor || 'rgba(255, 255, 255, 0.9)' }}
                        >
                          {!hasFailed ? (
                            <img
                              key={`${shortcut.id}-${stage}`}
                              src={getFaviconUrl(shortcut.url, stage)}
                              alt={shortcut.title}
                              onError={() => handleImageError(shortcut.id)}
                              className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-base">
                              {shortcut.title.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 truncate w-full text-center drop-shadow-sm">
                          {shortcut.title}
                        </span>
                      </a>

                      {/* Reorder Arrows in Edit Mode */}
                      {isEditing && (
                        <div className="flex items-center gap-1 mt-0.5 pb-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              moveShortcut(index, 'left');
                            }}
                            title="Pindah ke kiri"
                            className="p-1 rounded bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 transition-colors shadow-xs"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === shortcuts.length - 1}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              moveShortcut(index, 'right');
                            }}
                            title="Pindah ke kanan"
                            className="p-1 rounded bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 transition-colors shadow-xs"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Shortcut button */}
                <div className="flex flex-col items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    title="Tambah Pintasan Baru"
                    className="flex flex-col items-center gap-1.5 p-1 sm:p-1.5 rounded-xl hover:bg-white/60 dark:hover:bg-neutral-800/70 transition-all duration-200 hover:-translate-y-1 w-16 sm:w-20 group cursor-pointer"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-black/5 dark:bg-white/10 border border-dashed border-neutral-400/40 dark:border-neutral-600 group-hover:border-blue-500 dark:group-hover:border-blue-400 text-neutral-600 dark:text-neutral-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 shadow-sm transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 truncate w-full text-center group-hover:text-blue-500 dark:group-hover:text-blue-400">
                      Tambah
                    </span>
                  </button>
                </div>
              </div>

              {/* Scroll Right Button */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  title="Gulir ke kanan"
                  aria-label="Gulir ke kanan"
                  className="absolute -right-3 sm:-right-3.5 z-30 p-1.5 rounded-full bg-white/95 dark:bg-neutral-800/95 shadow-md border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:scale-110 active:scale-95 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <AddShortcutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={onAddShortcut}
      />
    </>
  );
};
