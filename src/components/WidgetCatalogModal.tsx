import React from 'react';
import {
  X,
  Clock,
  CloudSun,
  CheckSquare,
  Compass,
  FileText,
  Check,
  Plus,
  RotateCcw,
  Code,
  Edit3,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { CustomWidgetDef, WidgetState } from '../types';
import { getCustomWidgetIcon } from '../utils/iconMap';

interface WidgetCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetState[];
  customWidgets: CustomWidgetDef[];
  onToggleWidget: (id: string) => void;
  onResetLayout: () => void;
  onCreateCustomWidget: () => void;
  onEditCustomWidget: (widget: CustomWidgetDef) => void;
  onDeleteCustomWidget: (id: string) => void;
}

export const WidgetCatalogModal: React.FC<WidgetCatalogModalProps> = ({
  isOpen,
  onClose,
  widgets,
  customWidgets,
  onToggleWidget,
  onResetLayout,
  onCreateCustomWidget,
  onEditCustomWidget,
  onDeleteCustomWidget,
}) => {
  if (!isOpen) return null;

  const defaultCatalog = [
    {
      id: 'clock',
      title: 'Jam Digital & Kalender',
      desc: 'Penunjuk waktu digital modern, hari, tanggal masehi, format 12/24 jam, dan sapaan harian.',
      icon: <Clock className="w-5 h-5 text-blue-500" />,
    },
    {
      id: 'weather',
      title: 'Prakiraan Cuaca',
      desc: 'Informasi cuaca terkini, suhu, kelembapan, kecepatan angin, dan prakiraan cuaca 4 hari ke depan.',
      icon: <CloudSun className="w-5 h-5 text-amber-500" />,
    },
    {
      id: 'todo',
      title: 'Daftar Tugas Harian',
      desc: 'Catat todo list, centang tugas yang selesai, saring berdasarkan prioritas, dan pantau progres.',
      icon: <CheckSquare className="w-5 h-5 text-emerald-500" />,
    },
    {
      id: 'prayer',
      title: 'Jadwal Sholat & Imsak',
      desc: 'Waktu Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya dengan hitung mundur otomatis dan pilihan kota.',
      icon: <Compass className="w-5 h-5 text-teal-500" />,
    },
    {
      id: 'notes',
      title: 'Catatan Cepat (Sticky Notes)',
      desc: 'Memo dan coretan cepat untuk mencatat ide atau tautan penting secara praktis.',
      icon: <FileText className="w-5 h-5 text-yellow-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-950/50">
          <div className="flex items-center gap-2 font-semibold text-sm text-neutral-800 dark:text-neutral-100">
            <Plus className="w-4 h-4 text-blue-500" />
            <span>Katalog & Kelola Widget</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Custom Widget CTA Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500 text-white shadow-sm shrink-0">
                <Code className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                  Buat Widget Kustom Sendiri
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Tulis kode HTML, CSS, JS atau upload file manual.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onCreateCustomWidget}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Baru</span>
            </button>
          </div>

          {/* User Custom Widgets Section */}
          {customWidgets.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Widget Kustom Saya ({customWidgets.length})
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {customWidgets.map((custom) => {
                  const currentWidget = widgets.find((w) => w.id === custom.id);
                  const isAdded = currentWidget && currentWidget.isOpen;

                  return (
                    <div
                      key={custom.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-blue-500/[0.03] dark:bg-blue-500/[0.04] border border-blue-500/20 hover:border-blue-500/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                          {getCustomWidgetIcon(custom.icon, 'w-4 h-4')}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 truncate">
                              {custom.title}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                              Kustom
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Ukuran: {custom.width} × {custom.height}px
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => onEditCustomWidget(custom)}
                          title="Edit Kode & Tampilan"
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => onDeleteCustomWidget(custom.id)}
                          title="Hapus Widget Kustom"
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Active Button */}
                        <button
                          type="button"
                          onClick={() => onToggleWidget(custom.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isAdded
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20'
                              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Buka</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* System Default Widgets Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Widget Bawaan Sistem
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {defaultCatalog.map((item) => {
                const currentWidget = widgets.find((w) => w.id === item.id);
                const isAdded = currentWidget && currentWidget.isOpen;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:border-blue-500/20 transition-all"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5 line-clamp-2">
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleWidget(item.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isAdded
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20'
                          : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Aktif (Tutup)</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambahkan</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer with Reset Layout button */}
        <div className="px-4 py-3 bg-neutral-50/50 dark:bg-neutral-950/50 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onResetLayout();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tata Ulang Posisi (Reset Grid)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-500 text-white font-medium text-xs hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
