import React, { useState, useRef } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  X,
  Laptop,
  Check,
  HardDrive,
  Copy,
  Info,
} from 'lucide-react';
import {
  isChromeSyncAvailable,
  exportAllSettings,
  importAllSettings,
  initStorageSync,
} from '../utils/storage';

interface SyncBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsRestored?: () => void;
}

export const SyncBackupModal: React.FC<SyncBackupModalProps> = ({
  isOpen,
  onClose,
  onSettingsRestored,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isChromeExtension = isChromeSyncAvailable();

  const handleManualSyncNow = () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);

    // Trigger sync load
    initStorageSync((key, _val) => {
      console.log(`Synced key updated: ${key}`);
    });

    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMsg('Pengaturan berhasil diperbarui dari Chrome Sync!');
      if (onSettingsRestored) onSettingsRestored();
      setTimeout(() => setSyncStatusMsg(null), 3000);
    }, 600);
  };

  const handleExportBackup = () => {
    const jsonStr = exportAllSettings();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chrome-home-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    const jsonStr = exportAllSettings();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importAllSettings(content);
        if (success) {
          setSyncStatusMsg('Cadangan berhasil dipulihkan!');
          if (onSettingsRestored) onSettingsRestored();
          setTimeout(() => {
            setSyncStatusMsg(null);
            onClose();
          }, 1200);
        } else {
          setSyncStatusMsg('Format file cadangan tidak valid.');
          setTimeout(() => setSyncStatusMsg(null), 3000);
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div
      id="sync-backup-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="sync-backup-modal-content"
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col text-neutral-800 dark:text-neutral-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Sinkronisasi & Cadangan</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Otomatisasi sync antar perangkat via Google Chrome
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
          {/* Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              isChromeExtension
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-100'
            }`}
          >
            {isChromeExtension ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Laptop className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-semibold text-sm flex items-center gap-2">
                {isChromeExtension
                  ? 'Chrome Cloud Sync: Aktif'
                  : 'Mode Browser Web (Penyimpanan Lokal Aktif)'}
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {isChromeExtension
                  ? 'Setiap perubahan widget, shortcut, catatan, dan tema langsung otomatis disimpan ke akun Google Chrome Anda dan tersinkronisasi ke perangkat lain yang login dengan akun yang sama.'
                  : 'Saat dipasang sebagai ekstensi Chrome (Folder unpacked), fitur chrome.storage.sync akan otomatis menyinkronkan seluruh pengaturan antar laptop/komputer Anda.'}
              </p>
            </div>
          </div>

          {/* Sync Items Overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Item yang Disinkronkan
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Posisi & Ukuran Widget</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Pintasan Aplikasi (Shortcuts)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Daftar Tugas & Catatan</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Kota Cuaca & Jadwal Sholat</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Wallpaper Preset & URL Online</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Tema & Status Bilah Menu</span>
              </div>
            </div>
          </div>

          {/* Special Wallpaper Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Catatan Wallpaper:</strong> Wallpaper dari Preset dan URL Online akan tersinkron otomatis antar perangkat. Wallpaper dari unggahan file komputer lokal disimpan di penyimpanan internal perangkat agar tidak melebihi kuota sinkronisasi Chrome (100 KB).
            </p>
          </div>

          {/* Sync status message if any */}
          {syncStatusMsg && (
            <div className="p-2.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-xs text-blue-700 dark:text-blue-300 font-medium text-center animate-in fade-in">
              {syncStatusMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Opsi Cadangan & Sinkronisasi
            </h3>

            {isChromeExtension && (
              <button
                type="button"
                onClick={handleManualSyncNow}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium text-xs transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Ekspor JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium text-xs transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
              >
                <Upload className="w-4 h-4 text-purple-500" />
                <span>Pulihkan Cadangan</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <button
              type="button"
              onClick={handleCopyJson}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin data JSON pengaturan ke clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
