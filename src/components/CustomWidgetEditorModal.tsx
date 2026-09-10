import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Code,
  Sparkles,
  Upload,
  Play,
  Save,
  Palette,
  Layout,
  RefreshCw,
  Check,
  FileCode,
  Maximize2,
} from 'lucide-react';
import { CustomWidgetDef } from '../types';
import { AVAILABLE_CUSTOM_ICONS, getCustomWidgetIcon } from '../utils/iconMap';
import { STARTER_PRESETS } from '../utils/customWidgetPresets';
import { CustomSandboxFrame } from './widgets/CustomSandboxFrame';

interface CustomWidgetEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (widgetDef: CustomWidgetDef) => void;
  initialWidget?: CustomWidgetDef | null;
}

export const CustomWidgetEditorModal: React.FC<CustomWidgetEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialWidget,
}) => {
  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('code');
  const [width, setWidth] = useState(340);
  const [height, setHeight] = useState(260);

  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'preview'>('html');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');

  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset when modal opens or initialWidget changes
  useEffect(() => {
    if (initialWidget) {
      setTitle(initialWidget.title);
      setSelectedIcon(initialWidget.icon || 'code');
      setWidth(initialWidget.width || 340);
      setHeight(initialWidget.height || 260);
      setHtmlCode(initialWidget.html || '');
      setCssCode(initialWidget.css || '');
      setJsCode(initialWidget.js || '');
    } else {
      // Default to the first preset (Jam Analog Neon)
      const defaultPreset = STARTER_PRESETS[0];
      setTitle('Widget Kustom Saya');
      setSelectedIcon('code');
      setWidth(340);
      setHeight(270);
      setHtmlCode(defaultPreset.html);
      setCssCode(defaultPreset.css);
      setJsCode(defaultPreset.js);
    }
    setActiveTab('html');
    setUploadFeedback(null);
  }, [initialWidget, isOpen]);

  // Load a starter preset
  const handleLoadPreset = (presetName: string) => {
    const preset = STARTER_PRESETS.find((p) => p.name === presetName);
    if (!preset) return;
    setTitle(preset.name);
    setSelectedIcon(preset.icon);
    setWidth(preset.width);
    setHeight(preset.height);
    setHtmlCode(preset.html);
    setCssCode(preset.css);
    setJsCode(preset.js);
    setPreviewKey((k) => k + 1);
    setUploadFeedback(`Template "${preset.name}" berhasil dimuat!`);
    setTimeout(() => setUploadFeedback(null), 3000);
  };

  // Handle file upload (.html, .css, .js)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
        // Parse HTML file and extract styles & scripts if present
        let extractedCss = '';
        let extractedJs = '';
        let extractedHtml = content;

        // Extract <style>
        const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        let styleMatch;
        while ((styleMatch = styleRegex.exec(content)) !== null) {
          extractedCss += styleMatch[1] + '\n';
        }

        // Extract <script>
        const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;
        while ((scriptMatch = scriptRegex.exec(content)) !== null) {
          extractedJs += scriptMatch[1] + '\n';
        }

        // Strip <style> and <script> and <html>/<head>/<body> tags from HTML body
        extractedHtml = extractedHtml
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<\/?(html|head|body)[^>]*>/gi, '')
          .replace(/<!DOCTYPE[^>]*>/gi, '')
          .trim();

        // Extract title if present
        const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          setTitle(titleMatch[1].trim());
        } else if (!title || title === 'Widget Kustom Saya') {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }

        setHtmlCode(extractedHtml || content);
        if (extractedCss.trim()) setCssCode(extractedCss.trim());
        if (extractedJs.trim()) setJsCode(extractedJs.trim());

        setUploadFeedback(`File "${file.name}" berhasil diimpor & dipisah (HTML/CSS/JS)!`);
      } else if (fileName.endsWith('.css')) {
        setCssCode(content);
        setActiveTab('css');
        setUploadFeedback(`CSS dari "${file.name}" berhasil dimuat!`);
      } else if (fileName.endsWith('.js')) {
        setJsCode(content);
        setActiveTab('js');
        setUploadFeedback(`Script dari "${file.name}" berhasil dimuat!`);
      } else {
        setHtmlCode(content);
        setActiveTab('html');
        setUploadFeedback(`Konten dari "${file.name}" dimuat ke tab HTML.`);
      }

      setPreviewKey((k) => k + 1);
      setTimeout(() => setUploadFeedback(null), 4000);
    };

    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save widget handler
  const handleSaveWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const widgetDef: CustomWidgetDef = {
      id: initialWidget ? initialWidget.id : `custom_${Date.now()}`,
      title: title.trim(),
      icon: selectedIcon || 'code',
      html: htmlCode,
      css: cssCode,
      js: jsCode,
      width: Number(width) || 340,
      height: Number(height) || 260,
      createdAt: initialWidget ? initialWidget.createdAt : Date.now(),
    };

    onSave(widgetDef);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-950/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                {initialWidget ? 'Edit Widget Kustom' : 'Buat Widget Kustom (HTML / CSS / JS)'}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Tulis atau upload kode sendiri. Dijalankan aman dalam sandboxed environment.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSaveWidget} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {/* Top Row: Title, Icon Selector & Preset Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Title Input */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Judul Widget <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/10 text-blue-500 shrink-0">
                    {getCustomWidgetIcon(selectedIcon, 'w-4 h-4')}
                  </div>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Jam Analog Neon, Mini Calculator..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              {/* Starter Presets Selector */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Template Contoh (Opsional)
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {STARTER_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleLoadPreset(p.name)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-black/5 dark:bg-white/5 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 border border-black/5 dark:border-white/5 whitespace-nowrap transition-colors"
                      title={p.desc}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Pilih Ikon Widget
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                {AVAILABLE_CUSTOM_ICONS.map((iconOpt) => {
                  const isSelected = selectedIcon === iconOpt.id;
                  return (
                    <button
                      key={iconOpt.id}
                      type="button"
                      onClick={() => setSelectedIcon(iconOpt.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs font-medium'
                          : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-black/5 dark:border-white/5'
                      }`}
                    >
                      {iconOpt.icon}
                      <span className="text-[11px]">{iconOpt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dimensions (Width & Height) & File Upload Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Lebar Default (px)
                </label>
                <input
                  type="number"
                  min={260}
                  max={800}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Tinggi Default (px)
                </label>
                <input
                  type="number"
                  min={180}
                  max={800}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Upload File Button */}
              <div className="sm:col-span-6 sm:mt-4 flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm,.css,.js,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="custom-widget-file-input"
                />
                <label
                  htmlFor="custom-widget-file-input"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-black/5 dark:bg-white/5 hover:border-blue-500 hover:text-blue-500 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload / Impor File (.html / .css / .js)</span>
                </label>
              </div>
            </div>

            {/* Upload Feedback Notice */}
            {uploadFeedback && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0" />
                <span>{uploadFeedback}</span>
              </div>
            )}

            {/* Code Editor & Live Preview Section */}
            <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-neutral-900 text-neutral-100">
              {/* Tab Navigation Header */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950 border-b border-neutral-800 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('html')}
                    className={`px-3 py-1 rounded-md font-medium text-xs transition-colors ${
                      activeTab === 'html'
                        ? 'bg-neutral-800 text-amber-400 shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('css')}
                    className={`px-3 py-1 rounded-md font-medium text-xs transition-colors ${
                      activeTab === 'css'
                        ? 'bg-neutral-800 text-blue-400 shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    CSS
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('js')}
                    className={`px-3 py-1 rounded-md font-medium text-xs transition-colors ${
                      activeTab === 'js'
                        ? 'bg-neutral-800 text-yellow-400 shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    JavaScript
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('preview');
                      setPreviewKey((k) => k + 1);
                    }}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium text-xs transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                        : 'text-emerald-400/80 hover:text-emerald-300'
                    }`}
                  >
                    <Play className="w-3 h-3" />
                    <span>Live Preview</span>
                  </button>
                </div>

                {activeTab === 'preview' && (
                  <button
                    type="button"
                    onClick={() => setPreviewKey((k) => k + 1)}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white px-2 py-0.5 rounded hover:bg-neutral-800 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Muat Ulang</span>
                  </button>
                )}
              </div>

              {/* Active Tab Content Area */}
              <div className="relative min-h-[220px] max-h-[300px] overflow-hidden flex flex-col">
                {activeTab === 'html' && (
                  <textarea
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    placeholder="<!-- Tulis elemen HTML di sini, misal: <div class='counter'>0</div> -->"
                    rows={10}
                    className="w-full h-full p-3 bg-neutral-900 text-neutral-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                )}

                {activeTab === 'css' && (
                  <textarea
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    placeholder="/* Tulis styling CSS di sini, misal: body { color: #fff; } .counter { font-size: 24px; } */"
                    rows={10}
                    className="w-full h-full p-3 bg-neutral-900 text-blue-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                )}

                {activeTab === 'js' && (
                  <textarea
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    placeholder="// Tulis JavaScript di sini, misal: setInterval(() => { ... }, 1000);"
                    rows={10}
                    className="w-full h-full p-3 bg-neutral-900 text-yellow-100 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                )}

                {activeTab === 'preview' && (
                  <div className="w-full h-full min-h-[220px] bg-neutral-950 p-2 overflow-auto">
                    <CustomSandboxFrame
                      html={htmlCode}
                      css={cssCode}
                      js={jsCode}
                      onRefreshTrigger={previewKey}
                      title="Preview"
                      className="w-full h-full min-h-[200px] border border-neutral-800 rounded-lg bg-neutral-900"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Batal
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('preview');
                  setPreviewKey((k) => k + 1);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-neutral-700 dark:text-neutral-200 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-emerald-500" />
                <span>Uji Pratinjau</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{initialWidget ? 'Simpan Perubahan' : 'Simpan & Tambah Widget'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
