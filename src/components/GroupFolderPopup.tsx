import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Pencil,
  Check,
  ChevronLeft,
  ChevronRight,
  FolderMinus,
  FolderOpen,
  X,
  GripVertical,
} from 'lucide-react';
import { ShortcutItem } from '../types';
import { getOrRefreshShortcutIcon } from '../utils/shortcutIconCache';

interface GroupFolderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  group: ShortcutItem | null;
  anchor: { x: number; y: number } | null;
  onUpdateGroup: (updatedGroup: ShortcutItem) => void;
  onUngroup: (groupId: string) => void;
  onAddNewToGroup: (groupId: string) => void;
  onRemoveItemFromGroup: (groupId: string, itemId: string, moveToDock?: boolean) => void;
  onEditItem?: (item: ShortcutItem, groupId: string) => void;
  iconMap: Record<string, string>;
  onImageError: (item: ShortcutItem) => void;
  isParentEditing?: boolean;
}

export const GroupFolderPopup: React.FC<GroupFolderPopupProps> = ({
  isOpen,
  onClose,
  group,
  anchor,
  onUpdateGroup,
  onUngroup,
  onAddNewToGroup,
  onRemoveItemFromGroup,
  onEditItem,
  iconMap,
  onImageError,
  isParentEditing = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isLocalEditing, setIsLocalEditing] = useState(isParentEditing);
  const popupRef = useRef<HTMLDivElement>(null);

  // Drag & drop state inside popup
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sync title when opening or when group ID changes
  useEffect(() => {
    if (group) {
      setTitleInput(group.title);
      setIsEditingTitle(false);
    }
  }, [group?.id, isOpen]);

  // Sync local editing when parent dock edit mode changes
  useEffect(() => {
    setIsLocalEditing(isParentEditing);
  }, [isParentEditing]);

  // Click outside listener that does NOT close if click occurred inside the popup
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      // Use composedPath to safely handle unmounted/detached elements during React re-renders
      const path = e.composedPath ? e.composedPath() : [];
      if (
        popupRef.current &&
        (popupRef.current.contains(e.target as Node) || path.includes(popupRef.current))
      ) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !group || !group.isGroup || !anchor) return null;

  const items = group.items || [];

  const handleSaveRename = () => {
    if (titleInput.trim()) {
      onUpdateGroup({
        ...group,
        title: titleInput.trim(),
      });
    } else {
      setTitleInput(group.title);
    }
    setIsEditingTitle(false);
  };

  const handleMoveChild = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    onUpdateGroup({
      ...group,
      items: reordered,
    });
  };

  // Drag and Drop reordering handlers inside popup
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
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
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...items];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    onUpdateGroup({
      ...group,
      items: reordered,
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Popup width and responsive positioning
  const popupWidth = Math.min(340, window.innerWidth - 32);
  const halfWidth = popupWidth / 2;
  const leftPos = Math.max(16, Math.min(window.innerWidth - popupWidth - 16, anchor.x - halfWidth));
  const arrowLeftOffset = Math.max(16, Math.min(popupWidth - 16, anchor.x - leftPos));
  const bottomPos = window.innerHeight - anchor.y + 10;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Invisible backdrop to prevent hover/pointer events from leaking to dock & to handle click-outside */}
      <div
        className="fixed inset-0 bg-transparent"
        onClick={onClose}
      />

      {/* Anchored Popover Bubble */}
      <div
        ref={popupRef}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          left: `${leftPos}px`,
          bottom: `${bottomPos}px`,
          width: `${popupWidth}px`,
        }}
        className="relative z-10 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xl p-3.5 flex flex-col gap-2.5 animate-in zoom-in-95 fade-in duration-150 select-none"
      >
        {/* Header: Click title directly to rename, toggle edit mode */}
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <FolderOpen className="w-4 h-4 text-blue-500 shrink-0" />
            {isEditingTitle ? (
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveRename();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setTitleInput(group.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  placeholder="Nama folder..."
                  className="px-2 py-0.5 text-xs font-semibold rounded bg-black/5 dark:bg-white/10 border border-blue-500 text-neutral-900 dark:text-neutral-100 focus:outline-none w-full"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveRename();
                  }}
                  className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
                  title="Simpan nama"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                title="Klik untuk mengganti nama folder"
                className="text-xs font-bold text-neutral-800 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 truncate transition-colors text-left cursor-pointer group flex items-center gap-1"
              >
                <span>{group.title}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Toggle edit items inside group */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLocalEditing(!isLocalEditing);
              }}
              title={isLocalEditing ? 'Selesai mengatur' : 'Kelola aplikasi dalam grup'}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                isLocalEditing
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {isLocalEditing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Content Grid: Apps inside the group */}
        {items.length === 0 ? (
          <div className="py-6 text-center flex flex-col items-center justify-center gap-1.5 text-neutral-400 dark:text-neutral-500">
            <span className="text-xs">Grup ini kosong</span>
            <button
              type="button"
              onClick={() => onAddNewToGroup(group.id)}
              className="mt-1 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500 text-white text-[11px] font-medium hover:bg-blue-600 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah Aplikasi</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 max-h-[260px] overflow-y-auto p-1 custom-shortcut-scrollbar">
            {items.map((item, index) => {
              const iconSrc = iconMap[item.id] || getOrRefreshShortcutIcon(item, false, 0).iconUrl;
              const isBeingDragged = draggedIndex === index;
              const isDropTarget = dragOverIndex === index && draggedIndex !== index;

              return (
                <div
                  key={item.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative flex flex-col items-center rounded-xl transition-all duration-150 ${
                    isBeingDragged ? 'opacity-30 scale-95' : ''
                  } ${
                    isDropTarget ? 'ring-2 ring-blue-500 bg-blue-500/10 scale-105' : ''
                  } ${
                    isLocalEditing
                      ? 'p-0.5 bg-black/5 dark:bg-white/5 border border-dashed border-neutral-300 dark:border-neutral-700 cursor-grab active:cursor-grabbing'
                      : 'cursor-grab active:cursor-grabbing'
                  }`}
                >
                  {/* Action Buttons in edit mode: Pencil & X */}
                  {isLocalEditing && (
                    <div className="absolute -top-1 -right-1 z-30 flex items-center gap-1">
                      {onEditItem && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onEditItem(item, group.id);
                          }}
                          title={`Edit ${item.title} (URL, Nama, Icon)`}
                          className="w-4 h-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-xs transform hover:scale-110 transition-all cursor-pointer"
                        >
                          <Pencil className="w-2 h-2 stroke-[2.5]" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRemoveItemFromGroup(group.id, item.id, true);
                        }}
                        title={`Keluarkan ${item.title} ke bilah utama`}
                        className="w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xs transform hover:scale-110 transition-all cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5 stroke-[2.5]" />
                      </button>
                    </div>
                  )}

                  {/* Drag Grip Indicator in edit mode */}
                  {isLocalEditing && (
                    <div
                      className="absolute -top-0.5 -left-0.5 z-20 p-0.5 text-neutral-400 dark:text-neutral-500 pointer-events-none"
                      title="Tarik untuk memindahkan"
                    >
                      <GripVertical className="w-2.5 h-2.5" />
                    </div>
                  )}

                  {/* App Tile Link */}
                  <a
                    href={isLocalEditing ? undefined : item.url}
                    target={isLocalEditing ? undefined : '_self'}
                    onClick={(e) => {
                      if (isLocalEditing) {
                        e.preventDefault();
                        e.stopPropagation();
                      } else {
                        onClose();
                      }
                    }}
                    className={`flex flex-col items-center gap-1 p-1 rounded-xl w-full transition-colors duration-150 ${
                      !isLocalEditing
                        ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800/80 cursor-pointer group'
                        : 'pointer-events-none'
                    }`}
                  >
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-xs bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/60 overflow-hidden transition-transform duration-150 group-hover:scale-105"
                      style={item.bgColor ? { backgroundColor: item.bgColor } : undefined}
                    >
                      <img
                        src={iconSrc}
                        alt={item.title}
                        onError={() => onImageError(item)}
                        className="w-5 h-5 sm:w-6 sm:h-6 object-contain pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] font-medium text-neutral-800 dark:text-neutral-200 truncate w-full text-center drop-shadow-sm pointer-events-none">
                      {item.title}
                    </span>
                  </a>

                  {/* Reorder Arrows in Edit Mode */}
                  {isLocalEditing && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMoveChild(index, 'left');
                        }}
                        title="Pindah ke kiri"
                        className="p-0.5 rounded bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === items.length - 1}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMoveChild(index, 'right');
                        }}
                        title="Pindah ke kanan"
                        className="p-0.5 rounded bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick Add App Card */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => onAddNewToGroup(group.id)}
                title="Tambah Aplikasi ke Grup"
                className="flex flex-col items-center gap-1 p-1 rounded-xl w-full hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors duration-150 cursor-pointer group"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-neutral-100/80 dark:bg-neutral-800/80 border border-dashed border-neutral-300 dark:border-neutral-700 group-hover:border-blue-500 dark:group-hover:border-blue-400 text-neutral-500 dark:text-neutral-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 shadow-xs transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 truncate w-full text-center group-hover:text-blue-500 dark:group-hover:text-blue-400">
                  Tambah
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Footer: ONLY visible when isLocalEditing is active */}
        {isLocalEditing && (
          <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] animate-in fade-in duration-150">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUngroup(group.id);
              }}
              title="Keluarkan semua aplikasi ke bilah utama dan hapus grup"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 font-medium transition-colors cursor-pointer"
            >
              <FolderMinus className="w-3.5 h-3.5" />
              <span>Bongkar Grup</span>
            </button>
          </div>
        )}

        {/* Caret / Pointer pointing down directly to the folder tile */}
        <div
          style={{ left: `${arrowLeftOffset}px` }}
          className="absolute -bottom-1.5 -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-neutral-900 border-r border-b border-neutral-200/90 dark:border-neutral-800 shadow-xs pointer-events-none"
        />
      </div>
    </div>
  );
};
