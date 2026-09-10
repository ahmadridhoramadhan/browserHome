import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  Clock,
  MapPin,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  RefreshCw,
  Search,
  Check,
  Navigation,
  CloudSun,
} from 'lucide-react';
import { PrayerData } from '../../types';
import { CityOption, PRESET_CITIES, searchCities } from '../../utils/weatherApi';
import { fetchPrayerTimes, getTimezoneLabel } from '../../utils/prayerCalc';
import { STORAGE_KEYS, loadFromStorage, saveToStorage, subscribeToStorage } from '../../utils/storage';

export const PrayerWidget: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityOption>(() => {
    return loadFromStorage<CityOption>(STORAGE_KEYS.PRAYER_CITY, PRESET_CITIES[0]);
  });

  useEffect(() => {
    const unsub = subscribeToStorage(STORAGE_KEYS.PRAYER_CITY, (newVal) => {
      if (newVal && typeof newVal === 'object' && 'name' in newVal) {
        setSelectedCity(newVal as CityOption);
      }
    });
    return unsub;
  }, []);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<CityOption[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [countdownString, setCountdownString] = useState<string>('');

  // Load weather city if available for quick sync
  const weatherCity = loadFromStorage<CityOption | null>(STORAGE_KEYS.WEATHER_CITY, null);

  const loadTimes = useCallback(async (city: CityOption) => {
    setLoading(true);
    try {
      const data = await fetchPrayerTimes(city, new Date());
      setPrayerData(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimes(selectedCity);
  }, [selectedCity, loadTimes]);

  // Update countdown every 30 seconds
  useEffect(() => {
    const updateCountdown = () => {
      if (!prayerData || !prayerData.nextPrayer) return;
      const now = Date.now();
      const nextTime = prayerData.times.find((t) => t.name === prayerData.nextPrayer?.name);
      if (nextTime) {
        let diffMs = nextTime.timestamp - now;
        if (diffMs < 0) {
          // If passed, add 24 hours
          diffMs += 24 * 3600 * 1000;
        }
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
          setCountdownString(`${hours} jam ${minutes} mnt`);
        } else {
          setCountdownString(`${minutes} menit`);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);
    return () => clearInterval(interval);
  }, [prayerData]);

  const handleCitySelect = (city: CityOption) => {
    setSelectedCity(city);
    saveToStorage(STORAGE_KEYS.PRAYER_CITY, city);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchCities(searchQuery);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const geoCity: CityOption = {
          name: 'Lokasi Saya (GPS)',
          country: 'Otomatis',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        handleCitySelect(geoCity);
      },
      () => {
        setLoading(false);
      },
      { timeout: 8000 },
    );
  };

  const tzLabel = getTimezoneLabel(prayerData?.timezone, selectedCity.longitude);

  const getPrayerIcon = (name: string) => {
    switch (name) {
      case 'Subuh':
      case 'Imsak':
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Terbit':
        return <Sunrise className="w-3.5 h-3.5 text-amber-400" />;
      case 'Dzuhur':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'Ashar':
        return <Sun className="w-3.5 h-3.5 text-orange-400" />;
      case 'Maghrib':
        return <Sunset className="w-3.5 h-3.5 text-rose-400" />;
      case 'Isya':
        return <Moon className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-2.5 text-xs select-none">
      {/* Header with City Switcher & Quick Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-1 font-semibold text-neutral-800 dark:text-neutral-200 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors group cursor-pointer text-left"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="truncate max-w-[170px]">{selectedCity.name}</span>
          <span className="text-[10px] text-neutral-400 group-hover:text-emerald-400 font-normal">
            (ganti)
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Gunakan Lokasi Saat Ini (GPS)"
            onClick={handleUseGeolocation}
            className="p-1 rounded text-neutral-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Perbarui Jadwal Sholat"
            onClick={() => loadTimes(selectedCity)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* City Search / Picker Dropdown Panel */}
      {showSearch && (
        <div className="p-2.5 rounded-xl bg-neutral-100/95 dark:bg-neutral-800/95 border border-black/10 dark:border-white/10 flex flex-col gap-2 shadow-lg animate-in fade-in duration-150">
          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kota, kabupaten, kecamatan..."
                className="w-full text-xs pl-7 pr-2 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isSearching ? '...' : 'Cari'}
            </button>
          </form>

          {/* Quick Actions (GPS & Sync with Weather) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleUseGeolocation}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors cursor-pointer"
            >
              <Navigation className="w-3 h-3" />
              <span>Gunakan GPS Saya</span>
            </button>

            {weatherCity && weatherCity.name !== selectedCity.name && (
              <button
                type="button"
                onClick={() => handleCitySelect(weatherCity)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors cursor-pointer"
                title={`Samakan lokasi dengan widget cuaca (${weatherCity.name})`}
              >
                <CloudSun className="w-3 h-3" />
                <span className="truncate max-w-[130px]">Ikuti Cuaca ({weatherCity.name})</span>
              </button>
            )}
          </div>

          {/* Dynamic Search Results */}
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto border-t border-b border-black/5 dark:border-white/5 py-1.5">
              <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                Hasil Pencarian:
              </span>
              {searchResults.map((c, i) => (
                <button
                  key={`${c.name}-${i}`}
                  type="button"
                  onClick={() => handleCitySelect(c)}
                  className="text-left text-xs py-1.5 px-2 rounded-lg hover:bg-emerald-500/10 text-neutral-800 dark:text-neutral-200 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="truncate font-medium">{c.name}</span>
                  <span className="text-[10px] text-neutral-400 ml-2 shrink-0">{c.country}</span>
                </button>
              ))}
            </div>
          )}

          {/* Preset Popular Cities */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
              Kota Populer:
            </span>
            <div className="grid grid-cols-2 gap-1 max-h-28 overflow-y-auto">
              {PRESET_CITIES.map((c) => {
                const isSelected = selectedCity.name === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleCitySelect(c)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center justify-between cursor-pointer truncate ${
                      isSelected
                        ? 'bg-emerald-500 text-white font-semibold shadow-xs'
                        : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {isSelected && <Check className="w-3 h-3 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Next Prayer Highlight Card */}
      {prayerData && prayerData.nextPrayer && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              {getPrayerIcon(prayerData.nextPrayer.name)}
            </div>
            <div>
              <div className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                Menuju {prayerData.nextPrayer.label}
              </div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white">
                {prayerData.nextPrayer.time} {tzLabel}
              </div>
            </div>
          </div>
          {countdownString && (
            <div className="px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              {countdownString} lagi
            </div>
          )}
        </div>
      )}

      {/* Prayer Times Grid */}
      {prayerData && (
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 pt-1">
          {prayerData.times.map((item) => {
            const isNext = prayerData.nextPrayer?.name === item.name;
            return (
              <div
                key={item.name}
                className={`flex flex-col items-center p-1.5 rounded-lg border text-center transition-all ${
                  isNext
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                    : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/5 dark:border-white/5 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <div className={`mb-0.5 ${isNext ? 'text-white' : ''}`}>
                  {getPrayerIcon(item.name)}
                </div>
                <span
                  className={`text-[10px] font-semibold ${
                    isNext ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {item.label}
                </span>
                <span className="text-[11px] font-mono font-bold mt-0.5">{item.time}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-black/5 dark:border-white/5">
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-emerald-500" />
          Kemenag RI / Standard Astronomi
        </span>
        <span>Akurasi Tinggi {tzLabel ? `(${tzLabel})` : ''}</span>
      </div>
    </div>
  );
};
