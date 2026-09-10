import React, { useState } from 'react';
import { X, Image as ImageIcon, Upload, Link, Check, Sliders, Palette } from 'lucide-react';
import { BackgroundConfig } from '../types';
import { PRESET_WALLPAPERS, PRESET_GRADIENTS } from '../utils/storage';

interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BackgroundConfig;
  onChange: (newConfig: BackgroundConfig) => void;
}

export const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'gradients'>('presets');
  const [customUrl, setCustomUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (url: string) => {
    onChange({
      ...config,
      type: 'preset',
      value: url,
    });
  };

  const handleSelectGradient = (grad: string) => {
    onChange({
      ...config,
      type: 'gradient',
      value: grad,
    });
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onChange({
      ...config,
      type: 'custom-url',
      value: customUrl.trim(),
    });
    setCustomUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Harap pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    // Read and optimize with canvas if needed to keep localStorage light
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          onChange({
            ...config,
            type: 'upload',
            value: dataUrl,
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2 font-semibold text-sm text-neutral-800 dark:text-neutral-100">
            <Palette className="w-4 h-4 text-purple-500" />
            <span>Kustomisasi Latar Belakang (Wallpaper)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-black/5 dark:border-white/10 px-4 pt-2 gap-4 text-xs font-medium text-neutral-500">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'presets'
                ? 'text-purple-600 dark:text-purple-400 font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Wallpaper Pilihan
            {activeTab === 'presets' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gradients')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'gradients'
                ? 'text-purple-600 dark:text-purple-400 font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Gradien Minimalis
            {activeTab === 'gradients' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'custom'
                ? 'text-purple-600 dark:text-purple-400 font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Upload / Link Kustom
            {activeTab === 'custom' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 flex-1 overflow-y-auto">
          {activeTab === 'presets' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_WALLPAPERS.map((wp) => {
                const isSelected = config.value === wp.url;
                return (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => handleSelectPreset(wp.url)}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all group ${
                      isSelected
                        ? 'border-purple-500 shadow-md ring-2 ring-purple-500/20'
                        : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <img
                      src={wp.thumbnail}
                      alt={wp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] text-white font-medium truncate">{wp.name}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'gradients' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_GRADIENTS.map((grad, i) => {
                const isSelected = config.value === grad;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectGradient(grad)}
                    style={{ background: grad }}
                    className={`h-16 rounded-xl border-2 transition-all relative flex items-center justify-center ${
                      isSelected
                        ? 'border-purple-500 shadow-md ring-2 ring-purple-500/20'
                        : 'border-transparent hover:scale-[1.02]'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center shadow">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="flex flex-col gap-4 text-xs">
              {/* Image URL Form */}
              <form onSubmit={handleApplyUrl} className="flex flex-col gap-1.5">
                <label className="font-medium text-neutral-700 dark:text-neutral-300">
                  Gunakan URL Gambar Web:
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://example.com/wallpaper.jpg"
                      className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <Link className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                  </div>
                  <button
                    type="submit"
                    disabled={!customUrl.trim()}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    Terapkan
                  </button>
                </div>
              </form>

              {/* Local File Upload */}
              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-col gap-1.5">
                <label className="font-medium text-neutral-700 dark:text-neutral-300">
                  Upload dari Perangkat Anda:
                </label>
                <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-purple-500 dark:hover:border-purple-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                  <Upload className="w-6 h-6 text-neutral-400 group-hover:text-purple-500 mb-1" />
                  <span className="font-medium text-neutral-700 dark:text-neutral-200">
                    Klik untuk memilih gambar
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    JPG, PNG, atau WebP (Disimpan di browser)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {uploadError && <p className="text-red-500 text-[11px]">{uploadError}</p>}
              </div>
            </div>
          )}

          {/* Adjustments: Blur & Dimming */}
          <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-500" />
                Efek Blur Latar Belakang
              </span>
              <span className="text-[11px] text-neutral-400">{config.blur}px</span>
            </div>
            <div className="flex items-center gap-2">
              {[0, 4, 8, 12, 16].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => onChange({ ...config, blur: b })}
                  className={`flex-1 py-1 rounded-lg text-center text-[11px] font-medium transition-colors ${
                    config.blur === b
                      ? 'bg-purple-600 text-white'
                      : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  {b === 0 ? 'Tanpa Blur' : `${b}px`}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Redupkan Latar Belakang (Keterbacaan Teks)
              </span>
              <span className="text-[11px] text-neutral-400">{config.overlayOpacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={config.overlayOpacity}
              onChange={(e) => onChange({ ...config, overlayOpacity: Number(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-medium text-xs hover:bg-purple-700 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
