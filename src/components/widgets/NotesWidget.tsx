import React, { useState, useEffect } from 'react';
import { STORAGE_KEYS, loadFromStorage, saveToStorage, subscribeToStorage, isChromeSyncAvailable } from '../../utils/storage';

export const NotesWidget: React.FC = () => {
  const [content, setContent] = useState<string>(() => {
    return loadFromStorage<string>(
      STORAGE_KEYS.NOTES,
      'Catatan penting:\n• Selesaikan laporan mingguan\n• Rapat jam 14:00 WIB\n• Ide proyek baru...',
    );
  });

  useEffect(() => {
    const unsub = subscribeToStorage(STORAGE_KEYS.NOTES, (newVal) => {
      if (typeof newVal === 'string') {
        setContent(newVal);
      }
    });
    return unsub;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    saveToStorage(STORAGE_KEYS.NOTES, val);
  };

  return (
    <div className="flex flex-col gap-1.5 h-full select-none text-xs">
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Tulis catatan atau memo cepat di sini..."
        className="w-full h-36 p-2 rounded-lg bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-500/20 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 font-sans text-xs resize-none"
      />
      <div className="flex justify-between items-center text-[10px] text-neutral-400">
        <span>{isChromeSyncAvailable() ? 'Tersimpan & tersinkronisasi Chrome' : 'Tersimpan otomatis'}</span>
        <span>{content.length} karakter</span>
      </div>
    </div>
  );
};
