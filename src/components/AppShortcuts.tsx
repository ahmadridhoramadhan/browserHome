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
  FolderPlus,
  Folder,
} from 'lucide-react';
import { ShortcutItem } from '../types';
import { AddShortcutModal } from './AddShortcutModal';
import { GroupFolderPopup } from './GroupFolderPopup';
import { CreateGroupModal } from './CreateGroupModal';
import { loadFromStorage, saveToStorage, subscribeToStorage, STORAGE_KEYS } from '../utils/storage';
import {
  checkAndRefreshAllShortcutIcons,
  getOrRefreshShortcutIcon,
  handleIconFailureFallback,
  pruneExpiredIconCache,
} from '../utils/shortcutIconCache';

interface AppShortcutsProps {
  shortcuts: ShortcutItem[];
  onAddShortcut: (shortcut: ShortcutItem) => void;
  onRemoveShortcut: (id: string) => void;
  onReorderShortcuts: (shortcuts: ShortcutItem[]) => void;
  onUpdateShortcut?: (shortcut: ShortcutItem) => void;
}

export const AppShortcuts: React.FC<AppShortcutsProps> = ({
  shortcuts,
  onAddShortcut,
  onRemoveShortcut,
  onReorderShortcuts,
  onUpdateShortcut,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<ShortcutItem | null>(null);

  // Group Management states
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const activeGroup = shortcuts.find((s) => s.id === activeGroupId && s.isGroup) || null;
  const [popupAnchor, setPopupAnchor] = useState<{ x: number; y: number } | null>(null);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [targetGroupIdForAdd, setTargetGroupIdForAdd] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // Active icon URL mapping (shortcut.id -> active icon URL / SVG)
  const [iconMap, setIconMap] = useState<Record<string, string>>({});
  const [failedFaviconStages, setFailedFaviconStages] = useState<Record<string, number>>({});
  const [refreshNotification, setRefreshNotification] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Edit mode toggle state
  const [isEditing, setIsEditing] = useState(false);

  // Foldable state (persisted in localStorage & synced)
  const [isFolded, setIsFolded] = useState<boolean>(() => {
    return loadFromStorage<boolean>(STORAGE_KEYS.SHORTCUTS_FOLDED, false);
  });

  // Check 1-month local cache and automatically refresh any expired or missing icons upon opening
  useEffect(() => {
    pruneExpiredIconCache();
    const { iconMap: refreshedMap } = checkAndRefreshAllShortcutIcons(shortcuts, false);
    setIconMap(refreshedMap);
  }, [shortcuts]);

  useEffect(() => {
    const unsub = subscribeToStorage(STORAGE_KEYS.SHORTCUTS_FOLDED, (newVal) => {
      if (typeof newVal === 'boolean') {
        setIsFolded(newVal);
      }
    });
    return unsub;
  }, []);

  // Drag & drop state for reordering and dropping into folders
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleToggleFold = (folded: boolean) => {
    setIsFolded(folded);
    saveToStorage(STORAGE_KEYS.SHORTCUTS_FOLDED, folded);
    if (folded && isEditing) {
      setIsEditing(false);
    }
  };

  /**
   * Handle image loading error with multistage fallback
   */
  const handleImageError = (shortcut: ShortcutItem) => {
    const currentStage = failedFaviconStages[shortcut.id] || 0;
    const nextStage = currentStage + 1;

    setFailedFaviconStages((prev) => ({
      ...prev,
      [shortcut.id]: nextStage,
    }));

    if (nextStage <= 4) {
      const fallbackUrl = handleIconFailureFallback(shortcut, nextStage);
      setIconMap((prev) => ({
        ...prev,
        [shortcut.id]: fallbackUrl,
      }));
    }
  };

  /**
   * Force refresh a single shortcut's icon immediately
   */
  const handleForceRefreshSingle = (shortcut: ShortcutItem) => {
    setFailedFaviconStages((prev) => ({ ...prev, [shortcut.id]: 0 }));
    const result = getOrRefreshShortcutIcon(shortcut, true, 0);
    setIconMap((prev) => ({
      ...prev,
      [shortcut.id]: result.iconUrl,
    }));

    setRefreshNotification(`Icon "${shortcut.title}" diperbarui!`);
    setTimeout(() => setRefreshNotification(null), 2500);
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

    const draggedItem = shortcuts[draggedIndex];
    const targetItem = shortcuts[targetIndex];

    // If dropped onto an existing group folder: move dragged item into that folder!
    if (targetItem.isGroup && !draggedItem.isGroup) {
      const updated = [...shortcuts];
      // Remove dragged item from root
      updated.splice(draggedIndex, 1);
      // Find the group in the updated array
      const groupIdx = updated.findIndex((s) => s.id === targetItem.id);
      if (groupIdx !== -1) {
        const currentGroup = updated[groupIdx];
        const updatedGroup: ShortcutItem = {
          ...currentGroup,
          items: [...(currentGroup.items || []), draggedItem],
        };
        updated[groupIdx] = updatedGroup;
        onReorderShortcuts(updated);

        setRefreshNotification(`"${draggedItem.title}" dimasukkan ke grup "${targetItem.title}"`);
        setTimeout(() => setRefreshNotification(null), 2500);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Standard reorder
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

  const handleOpenAddModal = () => {
    setEditingShortcut(null);
    setTargetGroupIdForAdd(null);
    setEditingGroupId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (shortcut: ShortcutItem) => {
    setEditingShortcut(shortcut);
    setTargetGroupIdForAdd(null);
    setEditingGroupId(null);
    setIsModalOpen(true);
  };

  const handleEditItemInGroup = (item: ShortcutItem, groupId: string) => {
    setEditingGroupId(groupId);
    setTargetGroupIdForAdd(null);
    setEditingShortcut(item);
    setIsModalOpen(true);
  };

  // Group Handlers
  const handleCreateGroup = (groupTitle: string, selectedShortcutIds: string[]) => {
    const selectedItems = shortcuts.filter((s) => selectedShortcutIds.includes(s.id));
    const remainingShortcuts = shortcuts.filter((s) => !selectedShortcutIds.includes(s.id));

    const newGroup: ShortcutItem = {
      id: `group-${Date.now()}`,
      title: groupTitle,
      isGroup: true,
      items: selectedItems,
    };

    const updated = [...remainingShortcuts, newGroup];
    onReorderShortcuts(updated);

    setRefreshNotification(`Grup "${groupTitle}" berhasil dibuat!`);
    setTimeout(() => setRefreshNotification(null), 2500);
  };

  const handleUpdateGroup = (updatedGroup: ShortcutItem) => {
    const updated = shortcuts.map((s) => (s.id === updatedGroup.id ? updatedGroup : s));
    onReorderShortcuts(updated);
  };

  const handleUngroup = (groupId: string) => {
    const groupToDissolve = shortcuts.find((s) => s.id === groupId);
    if (!groupToDissolve) return;

    const childItems = groupToDissolve.items || [];
    const targetIndex = shortcuts.findIndex((s) => s.id === groupId);

    const updated = [...shortcuts];
    updated.splice(targetIndex, 1, ...childItems);
    onReorderShortcuts(updated);
    setActiveGroupId(null);

    setRefreshNotification(`Grup "${groupToDissolve.title}" dibongkar ke bilah utama.`);
    setTimeout(() => setRefreshNotification(null), 2500);
  };

  const handleRemoveItemFromGroup = (groupId: string, itemId: string, moveToDock = true) => {
    const group = shortcuts.find((s) => s.id === groupId);
    if (!group || !group.items) return;

    const itemToRemove = group.items.find((i) => i.id === itemId);
    const updatedItems = group.items.filter((i) => i.id !== itemId);
    const updatedGroup = { ...group, items: updatedItems };

    let updatedShortcuts = shortcuts.map((s) => (s.id === groupId ? updatedGroup : s));
    if (moveToDock && itemToRemove) {
      // Place the removed item next to the group
      const groupIdx = updatedShortcuts.findIndex((s) => s.id === groupId);
      updatedShortcuts.splice(groupIdx + 1, 0, itemToRemove);
    }

    onReorderShortcuts(updatedShortcuts);
  };

  const handleAddNewToGroup = (groupId: string) => {
    setTargetGroupIdForAdd(groupId);
    setEditingShortcut(null);
    setIsModalOpen(true);
  };

  const handleSaveModalShortcut = (newShortcut: ShortcutItem) => {
    if (targetGroupIdForAdd) {
      // Add shortcut into the target group
      const updated = shortcuts.map((s) => {
        if (s.id === targetGroupIdForAdd) {
          const currentItems = s.items || [];
          return { ...s, items: [...currentItems, newShortcut] };
        }
        return s;
      });
      onReorderShortcuts(updated);
      setTargetGroupIdForAdd(null);
    } else {
      onAddShortcut(newShortcut);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center select-none w-full max-w-4xl mx-auto px-4 z-20">
        {/* Toast Notification */}
        {refreshNotification && (
          <div className="mb-2 px-3 py-1.5 rounded-full bg-blue-600/90 text-white text-xs font-medium shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{refreshNotification}</span>
          </div>
        )}

        {/* FOLDED STATE */}
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
            {/* Dock Header */}
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
                    Tarik, ubah, atau buat grup aplikasi
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Create Group Button */}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsCreateGroupOpen(true)}
                    title="Buat grup/folder baru untuk mengelompokkan aplikasi"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-blue-500" />
                    <span className="hidden sm:inline">Buat Grup</span>
                  </button>
                )}

                {/* Toggle Edit Button */}
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  title={isEditing ? 'Selesai mengatur pintasan' : 'Atur urutan & kelola grup'}
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
                  className="absolute -left-3 sm:-left-3.5 z-30 p-1.5 rounded-full bg-white/95 dark:bg-neutral-800/95 shadow-md border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:scale-110 active:scale-95 transition-all cursor-pointer"
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
                  const hasFailed = stage >= 5;
                  const isBeingDragged = draggedIndex === index;
                  const isDropTarget = dragOverIndex === index && draggedIndex !== index;

                  // Render Group Folder vs Standard Shortcut
                  if (shortcut.isGroup) {
                    const groupItems = shortcut.items || [];
                    const previewItems = groupItems.slice(0, 4);

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
                            ? 'ring-2 ring-blue-500 bg-blue-500/15 scale-105'
                            : ''
                        } ${
                          isEditing
                            ? 'cursor-grab active:cursor-grabbing p-1 bg-black/5 dark:bg-white/5 border border-dashed border-neutral-300 dark:border-neutral-700'
                            : ''
                        }`}
                      >
                        {/* Delete / Ungroup Button in Edit Mode */}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleUngroup(shortcut.id);
                            }}
                            title={`Bongkar/Hapus grup ${shortcut.title}`}
                            className="absolute -top-1 -right-1 z-30 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transform hover:scale-110 transition-all duration-150 cursor-pointer"
                          >
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        )}

                        {/* Drag Handle in Edit Mode */}
                        {isEditing && (
                          <div
                            className="absolute -top-1 -left-1 z-20 p-1 text-neutral-400 dark:text-neutral-500 pointer-events-none"
                            title="Tarik untuk memindahkan"
                          >
                            <GripVertical className="w-3 h-3" />
                          </div>
                        )}

                        {/* Folder Tile Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setPopupAnchor({
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                            setActiveGroupId(shortcut.id);
                          }}
                          title={`Grup: ${shortcut.title} (${groupItems.length} aplikasi) - Klik untuk membuka`}
                          className={`flex flex-col items-center gap-1.5 p-1 sm:p-1.5 rounded-xl transition-all duration-200 w-16 sm:w-20 cursor-pointer ${
                            activeGroupId === shortcut.id
                              ? 'bg-white/70 dark:bg-neutral-800/80 ring-2 ring-blue-500/40 -translate-y-0.5'
                              : 'hover:bg-white/60 dark:hover:bg-neutral-800/70 group-hover:-translate-y-1'
                          }`}
                        >
                          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-md bg-white/90 dark:bg-neutral-800/90 border border-black/5 dark:border-white/10 overflow-hidden transition-transform duration-200 group-hover:scale-105 p-1.5">
                            {groupItems.length === 0 ? (
                              <Folder className="w-5 h-5 text-blue-500" />
                            ) : (
                              /* 2x2 Mini Apps Grid */
                              <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 items-center justify-center">
                                {previewItems.map((child) => {
                                  const childIcon =
                                    iconMap[child.id] || getOrRefreshShortcutIcon(child, false, 0).iconUrl;
                                  return (
                                    <div
                                      key={child.id}
                                      className="w-full h-full rounded-sm flex items-center justify-center bg-neutral-200/60 dark:bg-neutral-700/60 overflow-hidden"
                                    >
                                      <img
                                        src={childIcon}
                                        alt=""
                                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain"
                                      />
                                    </div>
                                  );
                                })}
                                {/* Placeholders if less than 4 */}
                                {Array.from({ length: Math.max(0, 4 - previewItems.length) }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-full h-full rounded-sm bg-neutral-200/40 dark:bg-neutral-700/40 opacity-40"
                                  />
                                ))}
                              </div>
                            )}

                            {/* Badge count */}
                            <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-neutral-500 dark:text-neutral-400">
                              {groupItems.length}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 max-w-full">
                            <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 truncate drop-shadow-sm">
                              {shortcut.title}
                            </span>
                          </div>
                        </button>

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
                              className="p-1 rounded bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500 hover:text-white transition-colors shadow-xs"
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
                              className="p-1 rounded bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500 hover:text-white transition-colors shadow-xs"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Standard Single Shortcut
                  const iconSrc = iconMap[shortcut.id] || getOrRefreshShortcutIcon(shortcut, false, stage).iconUrl;

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
                      {/* Action Buttons in Edit Mode: Pencil beside X */}
                      {isEditing && (
                        <div className="absolute -top-1 -right-1 z-30 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOpenEditModal(shortcut);
                            }}
                            title={`Edit ${shortcut.title} (URL, Nama, Icon)`}
                            className="w-5 h-5 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-md transform hover:scale-110 transition-all duration-150 cursor-pointer"
                          >
                            <Pencil className="w-2.5 h-2.5 stroke-[2.5]" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onRemoveShortcut(shortcut.id);
                            }}
                            title={`Hapus ${shortcut.title}`}
                            className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transform hover:scale-110 transition-all duration-150 cursor-pointer"
                          >
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>
                      )}

                      {/* Drag Handle in Edit Mode */}
                      {isEditing && (
                        <div
                          className="absolute -top-1 -left-1 z-20 p-1 text-neutral-400 dark:text-neutral-500 pointer-events-none"
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
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-md bg-white/90 dark:bg-neutral-800/90 border border-black/5 dark:border-white/10 overflow-hidden transition-transform duration-200 group-hover:scale-105"
                          style={shortcut.bgColor ? { backgroundColor: shortcut.bgColor } : undefined}
                        >
                          {!hasFailed ? (
                            <img
                              key={`${shortcut.id}-${stage}-${iconSrc}`}
                              src={iconSrc}
                              alt={shortcut.title}
                              onError={() => handleImageError(shortcut)}
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
                            className="p-1 rounded bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500 hover:text-white transition-colors shadow-xs"
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
                            className="p-1 rounded bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500 hover:text-white transition-colors shadow-xs"
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
                    onClick={handleOpenAddModal}
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
                  className="absolute -right-3 sm:-right-3.5 z-30 p-1.5 rounded-full bg-white/95 dark:bg-neutral-800/95 shadow-md border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Shortcut Modal */}
      <AddShortcutModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingShortcut(null);
          setTargetGroupIdForAdd(null);
          setEditingGroupId(null);
        }}
        onAdd={handleSaveModalShortcut}
        editingShortcut={editingShortcut}
        onUpdate={(updated) => {
          if (editingGroupId) {
            // Update child item inside group folder
            const updatedShortcuts = shortcuts.map((s) => {
              if (s.id === editingGroupId && s.items) {
                const newItems = s.items.map((child) => (child.id === updated.id ? updated : child));
                return { ...s, items: newItems };
              }
              return s;
            });
            onReorderShortcuts(updatedShortcuts);
            setEditingGroupId(null);
          } else if (onUpdateShortcut) {
            onUpdateShortcut(updated);
          }
          handleForceRefreshSingle(updated);
        }}
      />

      {/* Group Folder Popover Popup */}
      <GroupFolderPopup
        isOpen={Boolean(activeGroup)}
        onClose={() => {
          setActiveGroupId(null);
          setPopupAnchor(null);
        }}
        group={activeGroup}
        anchor={popupAnchor}
        onUpdateGroup={handleUpdateGroup}
        onUngroup={handleUngroup}
        onAddNewToGroup={handleAddNewToGroup}
        onRemoveItemFromGroup={handleRemoveItemFromGroup}
        onEditItem={handleEditItemInGroup}
        iconMap={iconMap}
        onImageError={handleImageError}
        isParentEditing={isEditing}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        availableShortcuts={shortcuts}
        onCreateGroup={handleCreateGroup}
        iconMap={iconMap}
      />
    </>
  );
};
