import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  CloudSun,
  CheckSquare,
  Compass,
  FileText,
  Edit3,
} from 'lucide-react';
import {
  BackgroundConfig,
  Position,
  ShortcutItem,
  ThemeMode,
  WidgetState,
  CustomWidgetDef,
} from './types';
import {
  STORAGE_KEYS,
  DEFAULT_SHORTCUTS,
  DEFAULT_BACKGROUND,
  getDefaultWidgets,
  loadFromStorage,
  saveToStorage,
  initStorageSync,
  subscribeToStorage,
} from './utils/storage';
import { TopBar } from './components/TopBar';
import { WindowFrame } from './components/WindowFrame';
import { ClockWidget } from './components/widgets/ClockWidget';
import { WeatherWidget } from './components/widgets/WeatherWidget';
import { TodoWidget } from './components/widgets/TodoWidget';
import { PrayerWidget } from './components/widgets/PrayerWidget';
import { NotesWidget } from './components/widgets/NotesWidget';
import { CustomRendererWidget } from './components/widgets/CustomRendererWidget';
import { AppShortcuts } from './components/AppShortcuts';
import { BackgroundSettingsModal } from './components/BackgroundSettingsModal';
import { WidgetCatalogModal } from './components/WidgetCatalogModal';
import { CustomWidgetEditorModal } from './components/CustomWidgetEditorModal';
import { SyncBackupModal } from './components/SyncBackupModal';
import { getCustomWidgetIcon } from './utils/iconMap';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return loadFromStorage<ThemeMode>(STORAGE_KEYS.THEME, 'dark');
  });

  // TopBar fold state (persisted in localStorage)
  const [isTopBarFolded, setIsTopBarFolded] = useState<boolean>(() => {
    return loadFromStorage<boolean>(STORAGE_KEYS.TOPBAR_FOLDED, false);
  });

  const handleToggleTopBarFold = (folded: boolean) => {
    setIsTopBarFolded(folded);
    saveToStorage(STORAGE_KEYS.TOPBAR_FOLDED, folded);
  };

  // Background configuration state
  const [background, setBackground] = useState<BackgroundConfig>(() => {
    return loadFromStorage<BackgroundConfig>(STORAGE_KEYS.BACKGROUND, DEFAULT_BACKGROUND);
  });

  // Shortcuts state
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(() => {
    return loadFromStorage<ShortcutItem[]>(STORAGE_KEYS.SHORTCUTS, DEFAULT_SHORTCUTS);
  });

  // Custom widgets definitions state
  const [customWidgets, setCustomWidgets] = useState<CustomWidgetDef[]>(() => {
    return loadFromStorage<CustomWidgetDef[]>(STORAGE_KEYS.CUSTOM_WIDGETS, []);
  });

  // Widgets state
  const [widgets, setWidgets] = useState<WidgetState[]>(() => {
    const loaded = loadFromStorage<WidgetState[]>(
      STORAGE_KEYS.WIDGETS,
      getDefaultWidgets(typeof window !== 'undefined' ? window.innerWidth : 1280),
    );
    // Sanitize and re-index so any previously inflated z-index from localStorage is safely reset to 10..N
    return loaded.map((w, idx) => ({
      ...w,
      zIndex: 10 + idx,
    }));
  });

  // Helper to bring a specific widget to front while keeping all widget z-indices strictly within 10..35
  const bringWidgetToFront = useCallback((list: WidgetState[], focusedId: string): WidgetState[] => {
    const target = list.find((w) => w.id === focusedId);
    if (!target) return list;

    const others = list.filter((w) => w.id !== focusedId).sort((a, b) => a.zIndex - b.zIndex);
    let curZ = 10;
    const reindexedOthers = others.map((w) => ({
      ...w,
      zIndex: curZ++,
    }));
    const focused = {
      ...target,
      zIndex: curZ,
    };
    return [...reindexedOthers, focused];
  }, []);

  // Modals state
  const [isWidgetCatalogOpen, setIsWidgetCatalogOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [isCustomEditorOpen, setIsCustomEditorOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [editingCustomWidget, setEditingCustomWidget] = useState<CustomWidgetDef | null>(null);

  // Initialize Chrome Storage Sync & subscribe to real-time changes across devices and tabs
  useEffect(() => {
    const cleanupSync = initStorageSync();

    const unsubBg = subscribeToStorage(STORAGE_KEYS.BACKGROUND, (newVal) => {
      if (newVal) setBackground(newVal as BackgroundConfig);
    });
    const unsubWidgets = subscribeToStorage(STORAGE_KEYS.WIDGETS, (newVal) => {
      if (Array.isArray(newVal)) setWidgets(newVal as WidgetState[]);
    });
    const unsubShortcuts = subscribeToStorage(STORAGE_KEYS.SHORTCUTS, (newVal) => {
      if (Array.isArray(newVal)) setShortcuts(newVal as ShortcutItem[]);
    });
    const unsubTheme = subscribeToStorage(STORAGE_KEYS.THEME, (newVal) => {
      if (newVal === 'dark' || newVal === 'light') setTheme(newVal);
    });
    const unsubCustom = subscribeToStorage(STORAGE_KEYS.CUSTOM_WIDGETS, (newVal) => {
      if (Array.isArray(newVal)) setCustomWidgets(newVal as CustomWidgetDef[]);
    });
    const unsubFold = subscribeToStorage(STORAGE_KEYS.TOPBAR_FOLDED, (newVal) => {
      if (typeof newVal === 'boolean') setIsTopBarFolded(newVal);
    });

    return () => {
      cleanupSync();
      unsubBg();
      unsubWidgets();
      unsubShortcuts();
      unsubTheme();
      unsubCustom();
      unsubFold();
    };
  }, []);

  const handleReloadAllSettings = useCallback(() => {
    setTheme(loadFromStorage<ThemeMode>(STORAGE_KEYS.THEME, 'dark'));
    setBackground(loadFromStorage<BackgroundConfig>(STORAGE_KEYS.BACKGROUND, DEFAULT_BACKGROUND));
    setShortcuts(loadFromStorage<ShortcutItem[]>(STORAGE_KEYS.SHORTCUTS, DEFAULT_SHORTCUTS));
    setCustomWidgets(loadFromStorage<CustomWidgetDef[]>(STORAGE_KEYS.CUSTOM_WIDGETS, []));
    setWidgets(
      loadFromStorage<WidgetState[]>(
        STORAGE_KEYS.WIDGETS,
        getDefaultWidgets(typeof window !== 'undefined' ? window.innerWidth : 1280),
      ),
    );
    setIsTopBarFolded(loadFromStorage<boolean>(STORAGE_KEYS.TOPBAR_FOLDED, false));
  }, []);

  // Sync theme with html document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveToStorage(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Debounced auto-save for widgets
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerWidgetsSave = useCallback((newWidgets: WidgetState[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage(STORAGE_KEYS.WIDGETS, newWidgets);
    }, 400);
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleBackgroundChange = (newBg: BackgroundConfig) => {
    setBackground(newBg);
    saveToStorage(STORAGE_KEYS.BACKGROUND, newBg);
  };

  const handleAddShortcut = (newShortcut: ShortcutItem) => {
    const updated = [...shortcuts, newShortcut];
    setShortcuts(updated);
    saveToStorage(STORAGE_KEYS.SHORTCUTS, updated);
  };

  const handleRemoveShortcut = (id: string) => {
    const updated = shortcuts.filter((s) => s.id !== id);
    setShortcuts(updated);
    saveToStorage(STORAGE_KEYS.SHORTCUTS, updated);
  };

  const handleReorderShortcuts = (reordered: ShortcutItem[]) => {
    setShortcuts(reordered);
    saveToStorage(STORAGE_KEYS.SHORTCUTS, reordered);
  };

  // Custom Widgets Management
  const handleSaveCustomWidget = (def: CustomWidgetDef) => {
    setCustomWidgets((prev) => {
      const exists = prev.some((w) => w.id === def.id);
      const updated = exists
        ? prev.map((w) => (w.id === def.id ? def : w))
        : [...prev, def];
      saveToStorage(STORAGE_KEYS.CUSTOM_WIDGETS, updated);
      return updated;
    });

    // Also update or open the active window for this custom widget
    setWidgets((prev) => {
      const existing = prev.find((w) => w.id === def.id || w.customId === def.id);
      let updated: WidgetState[];
      if (existing) {
        updated = prev.map((w) =>
          w.id === existing.id
            ? {
                ...w,
                title: def.title,
                size: { width: def.width, height: def.height },
              }
            : w,
        );
        updated = bringWidgetToFront(updated, existing.id);
      } else {
        const newW: WidgetState = {
          id: def.id,
          type: 'custom',
          title: def.title,
          isOpen: true,
          isMinimized: false,
          position: {
            x: Math.max(40, window.innerWidth / 2 - def.width / 2),
            y: 130,
          },
          zIndex: 10 + prev.length,
          size: { width: def.width, height: def.height },
          customId: def.id,
        };
        updated = bringWidgetToFront([...prev, newW], def.id);
      }
      triggerWidgetsSave(updated);
      return updated;
    });
  };

  const handleDeleteCustomWidget = (id: string) => {
    setCustomWidgets((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      saveToStorage(STORAGE_KEYS.CUSTOM_WIDGETS, updated);
      return updated;
    });
    // Remove from active desktop windows
    setWidgets((prev) => {
      const updated = prev.filter((w) => w.id !== id && w.customId !== id);
      triggerWidgetsSave(updated);
      return updated;
    });
  };

  const handleOpenCreateCustom = () => {
    setEditingCustomWidget(null);
    setIsCustomEditorOpen(true);
  };

  const handleOpenEditCustom = (def: CustomWidgetDef) => {
    setEditingCustomWidget(def);
    setIsCustomEditorOpen(true);
  };

  // Window Focus: bring to front safely within 10..35
  const handleFocusWidget = (id: string) => {
    setWidgets((prev) => {
      const updated = bringWidgetToFront(prev, id);
      triggerWidgetsSave(updated);
      return updated;
    });
  };

  // Position change from dragging
  const handlePositionChange = useCallback((id: string, newPos: Position) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, position: newPos } : w));
      triggerWidgetsSave(updated);
      return updated;
    });
  }, [triggerWidgetsSave]);

  // Minimize / Expand toggle
  const handleMinimizeToggle = (id: string) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
      triggerWidgetsSave(updated);
      return updated;
    });
  };

  // Close / Hide widget
  const handleCloseWidget = (id: string) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w));
      triggerWidgetsSave(updated);
      return updated;
    });
  };

  // Toggle widget visibility from catalog
  const handleToggleWidget = (id: string) => {
    setWidgets((prev) => {
      const existing = prev.find((w) => w.id === id || w.customId === id);
      let updated: WidgetState[];

      if (existing) {
        const nextIsOpen = !existing.isOpen;
        if (nextIsOpen) {
          const toggled = prev.map((w) =>
            w.id === existing.id ? { ...w, isOpen: true, isMinimized: false } : w,
          );
          updated = bringWidgetToFront(toggled, existing.id);
        } else {
          updated = prev.map((w) => (w.id === existing.id ? { ...w, isOpen: false } : w));
        }
      } else {
        // Check if this id belongs to a custom widget
        const customDef = customWidgets.find((cw) => cw.id === id);
        if (customDef) {
          const newW: WidgetState = {
            id: customDef.id,
            type: 'custom',
            title: customDef.title,
            isOpen: true,
            isMinimized: false,
            position: {
              x: Math.max(40, window.innerWidth / 2 - customDef.width / 2),
              y: 130,
            },
            zIndex: 10 + prev.length,
            size: { width: customDef.width, height: customDef.height },
            customId: customDef.id,
          };
          updated = bringWidgetToFront([...prev, newW], customDef.id);
        } else {
          // Standard built-in widgets
          const defs: Record<string, { title: string; width: number; height: number; type: WidgetState['type'] }> = {
            clock: { title: 'Jam & Kalender', width: 360, height: 190, type: 'clock' },
            weather: { title: 'Prakiraan Cuaca', width: 360, height: 275, type: 'weather' },
            prayer: { title: 'Jadwal Sholat', width: 380, height: 285, type: 'prayer' },
            todo: { title: 'Daftar Tugas Harian', width: 380, height: 360, type: 'todo' },
            notes: { title: 'Catatan Cepat', width: 320, height: 220, type: 'notes' },
          };
          const def = defs[id] || { title: 'Widget', width: 340, height: 240, type: 'notes' };
          const newW: WidgetState = {
            id,
            type: def.type,
            title: def.title,
            isOpen: true,
            isMinimized: false,
            position: { x: Math.max(40, window.innerWidth / 2 - 180), y: 150 },
            zIndex: 10 + prev.length,
            size: { width: def.width, height: def.height },
          };
          updated = bringWidgetToFront([...prev, newW], id);
        }
      }

      triggerWidgetsSave(updated);
      return updated;
    });
  };

  // Reset window positions to clean desktop arrangement
  const handleResetLayout = () => {
    const defaults = getDefaultWidgets(window.innerWidth);
    setWidgets((prev) => {
      const updated = prev.map((w) => {
        const match = defaults.find((d) => d.id === w.id);
        if (match) {
          return {
            ...w,
            isOpen: true,
            isMinimized: false,
            position: match.position,
            zIndex: match.zIndex,
          };
        }
        return {
          ...w,
          isOpen: true,
          isMinimized: false,
          position: { x: 80, y: 140 },
        };
      });
      triggerWidgetsSave(updated);
      return updated;
    });
  };

  // Render widget content
  const renderWidgetContent = (widget: WidgetState) => {
    if (widget.type === 'custom') {
      const customDef = customWidgets.find((cw) => cw.id === widget.id || cw.id === widget.customId);
      if (!customDef) {
        return (
          <div className="p-4 text-center text-xs text-neutral-400">
            Widget kustom tidak ditemukan atau telah dihapus.
          </div>
        );
      }
      return <CustomRendererWidget customDef={customDef} />;
    }

    switch (widget.type) {
      case 'clock':
        return <ClockWidget />;
      case 'weather':
        return <WeatherWidget />;
      case 'todo':
        return <TodoWidget />;
      case 'prayer':
        return <PrayerWidget />;
      case 'notes':
        return <NotesWidget />;
      default:
        return null;
    }
  };

  // Render widget icon
  const renderWidgetIcon = (widget: WidgetState) => {
    if (widget.type === 'custom') {
      const customDef = customWidgets.find((cw) => cw.id === widget.id || cw.id === widget.customId);
      return (
        <span className="text-blue-500 flex items-center justify-center">
          {getCustomWidgetIcon(customDef?.icon, 'w-4 h-4')}
        </span>
      );
    }

    switch (widget.type) {
      case 'clock':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'weather':
        return <CloudSun className="w-4 h-4 text-amber-500" />;
      case 'todo':
        return <CheckSquare className="w-4 h-4 text-emerald-500" />;
      case 'prayer':
        return <Compass className="w-4 h-4 text-teal-500" />;
      case 'notes':
        return <FileText className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  // Background styling computation
  const getBackgroundStyle = (): React.CSSProperties => {
    if (background.type === 'gradient') {
      return { background: background.value };
    }
    return {
      backgroundImage: `url(${background.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  };

  const activeWidgets = widgets.filter((w) => w.isOpen);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-sans">
      {/* Dynamic Custom Background */}
      <div
        className="absolute inset-0 transition-all duration-300 pointer-events-none"
        style={{
          ...getBackgroundStyle(),
          filter: background.blur > 0 ? `blur(${background.blur}px)` : 'none',
          transform: background.blur > 0 ? 'scale(1.05)' : 'none',
        }}
      />

      {/* Dim / Readability Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-200 pointer-events-none"
        style={{
          backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
          opacity: background.overlayOpacity / 100,
        }}
      />

      {/* Top Application Bar */}
      <TopBar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenWidgetCatalog={() => setIsWidgetCatalogOpen(true)}
        onOpenWallpaperModal={() => setIsWallpaperModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onResetLayout={handleResetLayout}
        activeWidgetCount={activeWidgets.length}
        isFolded={isTopBarFolded}
        onToggleFold={handleToggleTopBarFold}
      />

      {/* Main Desktop Canvas for Draggable Windows */}
      <main
        className={`relative w-full h-full ${
          isTopBarFolded ? 'pt-4 sm:pt-6' : 'pt-14'
        } pb-28 overflow-hidden transition-all duration-200`}
      >
        {/* Render all open windows */}
        {activeWidgets.map((widget) => {
          const customDef =
            widget.type === 'custom'
              ? customWidgets.find((cw) => cw.id === widget.id || cw.id === widget.customId)
              : undefined;

          return (
            <WindowFrame
              key={widget.id}
              id={widget.id}
              title={widget.title}
              icon={renderWidgetIcon(widget)}
              position={widget.position}
              zIndex={widget.zIndex}
              isMinimized={widget.isMinimized}
              onPositionChange={handlePositionChange}
              onFocus={handleFocusWidget}
              onMinimizeToggle={handleMinimizeToggle}
              onClose={handleCloseWidget}
              defaultWidth={widget.size?.width || 360}
              minY={isTopBarFolded ? 8 : 12}
              headerRightContent={
                widget.type === 'custom' && customDef ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditCustom(customDef);
                    }}
                    title="Edit Kode & Desain Widget"
                    className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:text-blue-500 dark:text-neutral-400 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                ) : undefined
              }
            >
              {renderWidgetContent(widget)}
            </WindowFrame>
          );
        })}

        {/* Center / Bottom App Shortcuts Dock */}
        <div className="absolute bottom-4 left-0 right-0 z-30 pointer-events-auto">
          <AppShortcuts
            shortcuts={shortcuts}
            onAddShortcut={handleAddShortcut}
            onRemoveShortcut={handleRemoveShortcut}
            onReorderShortcuts={handleReorderShortcuts}
          />
        </div>
      </main>

      {/* Modals */}
      <WidgetCatalogModal
        isOpen={isWidgetCatalogOpen}
        onClose={() => setIsWidgetCatalogOpen(false)}
        widgets={widgets}
        customWidgets={customWidgets}
        onToggleWidget={handleToggleWidget}
        onResetLayout={handleResetLayout}
        onCreateCustomWidget={handleOpenCreateCustom}
        onEditCustomWidget={handleOpenEditCustom}
        onDeleteCustomWidget={handleDeleteCustomWidget}
      />

      <CustomWidgetEditorModal
        isOpen={isCustomEditorOpen}
        onClose={() => {
          setIsCustomEditorOpen(false);
          setEditingCustomWidget(null);
        }}
        onSave={handleSaveCustomWidget}
        initialWidget={editingCustomWidget}
      />

      <BackgroundSettingsModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        config={background}
        onChange={handleBackgroundChange}
      />

      <SyncBackupModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSettingsRestored={handleReloadAllSettings}
      />
    </div>
  );
}
