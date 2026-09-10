import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles } from 'lucide-react';

export const ClockWidget: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());
  const [use24Hour, setUse24Hour] = useState<boolean>(() => {
    return localStorage.getItem('clock_24h') !== 'false';
  });
  const [showSeconds, setShowSeconds] = useState<boolean>(() => {
    return localStorage.getItem('clock_seconds') !== 'false';
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggle24h = () => {
    const newVal = !use24Hour;
    setUse24Hour(newVal);
    localStorage.setItem('clock_24h', String(newVal));
  };

  const toggleSeconds = () => {
    const newVal = !showSeconds;
    setShowSeconds(newVal);
    localStorage.setItem('clock_seconds', String(newVal));
  };

  const hours = time.getHours();
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  let displayHours = hours;
  let ampm = '';
  if (!use24Hour) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    displayHours = hours % 12 || 12;
  }
  const formattedHours = String(displayHours).padStart(2, '0');

  // Greeting in Indonesian
  let greeting = 'Selamat Datang';
  if (hours >= 4 && hours < 11) greeting = 'Selamat Pagi';
  else if (hours >= 11 && hours < 15) greeting = 'Selamat Siang';
  else if (hours >= 15 && hours < 18) greeting = 'Selamat Sore';
  else greeting = 'Selamat Malam';

  // Indonesian date formatting
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = time.toLocaleDateString('id-ID', dateOptions);

  return (
    <div className="flex flex-col items-center text-center select-none py-1">
      {/* Greeting tag */}
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 mb-2 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
        <Sparkles className="w-3 h-3" />
        <span>{greeting}</span>
      </div>

      {/* Main Digital Clock */}
      <div className="flex items-baseline justify-center font-mono font-bold tracking-tight text-neutral-900 dark:text-white">
        <span className="text-4xl sm:text-5xl font-extrabold">{formattedHours}</span>
        <span className="text-3xl sm:text-4xl text-blue-500 animate-pulse mx-1">:</span>
        <span className="text-4xl sm:text-5xl font-extrabold">{minutes}</span>
        {showSeconds && (
          <>
            <span className="text-2xl sm:text-3xl text-neutral-400 dark:text-neutral-500 mx-0.5">:</span>
            <span className="text-2xl sm:text-3xl font-semibold text-neutral-500 dark:text-neutral-400">
              {seconds}
            </span>
          </>
        )}
        {!use24Hour && (
          <span className="ml-2 text-xs font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400">
            {ampm}
          </span>
        )}
      </div>

      {/* Full Date */}
      <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-300">
        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
        <span>{formattedDate}</span>
      </div>

      {/* Quick Settings Toggles */}
      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 w-full justify-center">
        <button
          id="clock-toggle-24h-btn"
          type="button"
          onClick={toggle24h}
          className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${
            use24Hour
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {use24Hour ? '24 Jam' : '12 Jam'}
        </button>
        <button
          id="clock-toggle-seconds-btn"
          type="button"
          onClick={toggleSeconds}
          className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${
            showSeconds
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {showSeconds ? 'Detik Aktif' : 'Detik Mati'}
        </button>
      </div>
    </div>
  );
};
