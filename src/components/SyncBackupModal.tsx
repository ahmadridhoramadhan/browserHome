import React, { useState, useRef, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  X,
  Check,
  Copy,
  Info,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  FileCode,
} from 'lucide-react';
import {
  exportAllSettings,
  importAllSettings,
  pullSettingsFromChromeSync,
  pushSettingsToChromeSync,
  getLastSyncTimes,
} from '../utils/storage';

interface SyncBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsRestored?: () => void;
}

type SyncTab = 'chrome' | 'file';

function formatTimestamp(isoStr: string | null): string {
  if (!isoStr) return 'Belum pernah';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

export const SyncBackupModal: React.FC<SyncBackupModalProps> = ({
  isOpen,
  onClose,
  onSettingsRestored,
}) => {
  const [activeTab, setActiveTab] = useState<SyncTab>('chrome');
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [quickPasteOpen, setQuickPasteOpen] = useState(false);
  const [quickPasteText, setQuickPasteText] = useState('');

  // Sync Times
  const [syncTimes, setSyncTimes] = useState(() => getLastSyncTimes());

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSyncTimes(getLastSyncTimes());
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Pull / Download latest settings from Chrome Sync
  const handlePullFromChromeSync = async () => {
    setIsPulling(true);
    setStatusMsg(null);

    try {
      const result = await pullSettingsFromChromeSync();
      if (result.success) {
        setStatusMsg({
          type: 'success',
          text: result.message || 'Pengaturan terbaru berhasil diunduh dari Chrome Sync!',
        });
        setSyncTimes(getLastSyncTimes());
        if (onSettingsRestored) {
          onSettingsRestored();
        }
      } else {
        setStatusMsg({
          type: 'error',
          text: result.message,
        });
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: `Gagal mengunduh: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsPulling(false);
    }
  };

  // 2. Push / Upload current settings to Chrome Sync
  const handlePushToChromeSync = async () => {
    setIsPushing(true);
    setStatusMsg(null);

    try {
      const result = await pushSettingsToChromeSync();
      if (result.success) {
        setStatusMsg({
          type: 'success',
          text: result.message || 'Pengaturan berhasil diunggah ke Chrome Sync!',
        });
        setSyncTimes(getLastSyncTimes());
      } else {
        setStatusMsg({
          type: 'error',
          text: result.message,
        });
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: `Gagal mengunggah: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsPushing(false);
    }
  };

  // 3. File export
  const handleExportBackup = () => {
    const jsonStr = exportAllSettings();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chrome-home-settings-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 4. Copy JSON
  const handleCopyJson = () => {
    const jsonStr = exportAllSettings();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 5. File import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importAllSettings(content);
        if (success) {
          setStatusMsg({
            type: 'success',
            text: 'Cadangan berhasil dipulihkan dan diterapkan!',
          });
          setSyncTimes(getLastSyncTimes());
          if (onSettingsRestored) onSettingsRestored();
          setTimeout(() => {
            setStatusMsg(null);
            onClose();
          }, 1200);
        } else {
          setStatusMsg({
            type: 'error',
            text: 'Format file cadangan tidak valid atau rusak.',
          });
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // 6. Quick text paste import
  const handleApplyQuickPaste = () => {
    if (!quickPasteText.trim()) {
      setStatusMsg({
        type: 'error',
        text: 'Tempelkan teks JSON pengaturan terlebih dahulu.',
      });
      return;
    }

    const success = importAllSettings(quickPasteText);
    if (success) {
      setStatusMsg({
        type: 'success',
        text: 'Pengaturan berhasil diterapkan langsung dari teks!',
      });
      setQuickPasteText('');
      setQuickPasteOpen(false);
      setSyncTimes(getLastSyncTimes());
      if (onSettingsRestored) onSettingsRestored();
    } else {
      setStatusMsg({
        type: 'error',
        text: 'Format teks JSON tidak sesuai atau tidak mengandung pengaturan yang valid.',
      });
    }
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
        className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col text-neutral-800 dark:text-neutral-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Sinkronisasi & Unduh Pengaturan</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Ambil pengaturan terbaru dari Chrome Cloud Sync atau file cadangan
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-6 pt-2 bg-neutral-50/50 dark:bg-neutral-900/50 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('chrome');
              setStatusMsg(null);
            }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chrome'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Chrome Cloud Sync</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('file');
              setStatusMsg(null);
            }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'file'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>File & Cadangan</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* Status Feedback Banner */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2.5 animate-in fade-in ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                  : statusMsg.type === 'error'
                  ? 'bg-red-500/15 border-red-500/30 text-red-800 dark:text-red-200'
                  : 'bg-blue-500/15 border-blue-500/30 text-blue-800 dark:text-blue-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">{statusMsg.text}</div>
            </div>
          )}

          {/* TAB 1: Chrome Cloud Sync */}
          {activeTab === 'chrome' && (
            <div className="space-y-4">
              {/* Timestamp Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-semibold text-neutral-400">Terakhir Diambil (Download)</div>
                    <div className="font-medium text-neutral-700 dark:text-neutral-200 truncate">
                      {formatTimestamp(syncTimes.download)}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-semibold text-neutral-400">Terakhir Diunggah (Upload)</div>
                    <div className="font-medium text-neutral-700 dark:text-neutral-200 truncate">
                      {formatTimestamp(syncTimes.upload)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Explicit Download and Upload */}
              <div className="space-y-2.5 pt-1">
                <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Aksi Sinkronisasi
                </div>

                {/* Main Download Button */}
                <button
                  type="button"
                  onClick={handlePullFromChromeSync}
                  disabled={isPulling || isPushing}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <ArrowDownCircle className={`w-5 h-5 ${isPulling ? 'animate-bounce' : ''}`} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold flex items-center gap-1.5">
                        <span>Ambil Pengaturan Terbaru (Download)</span>
                        {isPulling && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      </div>
                      <div className="text-blue-100 text-[11px]">
                        Tarik dan terapkan data widget, pintasan, dan preferensi dari Chrome Cloud
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-white/20 text-[11px] font-semibold">Tarik Data</span>
                </button>

                {/* Upload Button */}
                <button
                  type="button"
                  onClick={handlePushToChromeSync}
                  disabled={isPulling || isPushing}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700/90 text-neutral-800 dark:text-neutral-100 font-medium text-xs border border-neutral-200 dark:border-neutral-700 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <ArrowUpCircle className={`w-5 h-5 ${isPushing ? 'animate-bounce' : ''}`} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold flex items-center gap-1.5">
                        <span>Unggah Pengaturan Saat Ini (Upload)</span>
                        {isPushing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      </div>
                      <div className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                        Simpan seluruh tata letak dan konfigurasi beranda ini ke Chrome Cloud
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/10 text-[11px] font-semibold">Simpan Cloud</span>
                </button>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/40 text-xs text-neutral-500 dark:text-neutral-400 flex gap-2 items-start">
                <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Data yang disinkronkan meliputi posisi widget, pintasan URL, catatan, todo list, jadwal sholat, kota cuaca, dan wallpaper preset/online.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: File & Cadangan Tradisional */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium text-xs transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
                >
                  <Download className="w-4 h-4 text-emerald-500" />
                  <div className="text-left">
                    <div className="font-semibold">Unduh File JSON</div>
                    <div className="text-[10px] text-neutral-400">Simpan ke harddisk</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium text-xs transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
                >
                  <Upload className="w-4 h-4 text-blue-500" />
                  <div className="text-left">
                    <div className="font-semibold">Pulihkan dari File</div>
                    <div className="text-[10px] text-neutral-400">Pilih file .json</div>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Copy to Clipboard */}
              <button
                type="button"
                onClick={handleCopyJson}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-neutral-500" />
                    <span>Salin Seluruh Data JSON ke Clipboard</span>
                  </>
                )}
              </button>

              {/* Collapsible Quick Paste Section */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setQuickPasteOpen(!quickPasteOpen)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <span>{quickPasteOpen ? '▼ Sembunyikan Tempel Teks Langsung' : '▶ Tempel Teks Pengaturan JSON Langsung (Quick Paste)'}</span>
                </button>

                {quickPasteOpen && (
                  <div className="mt-2.5 space-y-2 animate-in fade-in">
                    <textarea
                      rows={4}
                      value={quickPasteText}
                      onChange={(e) => setQuickPasteText(e.target.value)}
                      placeholder='Tempelkan kode JSON pengaturan di sini (contoh: { "version": "1.0", ... })'
                      className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-[11px] text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyQuickPaste}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow transition-colors cursor-pointer"
                    >
                      Terapkan Pengaturan dari Teks Ini
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
