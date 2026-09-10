import React, { useState, useEffect, useCallback } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Snowflake,
  Wind,
  Droplets,
  MapPin,
  RefreshCw,
  Search,
  Check,
} from 'lucide-react';
import { WeatherData } from '../../types';
import { CityOption, PRESET_CITIES, fetchWeather, searchCities } from '../../utils/weatherApi';
import { STORAGE_KEYS, loadFromStorage, saveToStorage, subscribeToStorage } from '../../utils/storage';

export const WeatherWidget: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityOption>(() => {
    return loadFromStorage<CityOption>(STORAGE_KEYS.WEATHER_CITY, PRESET_CITIES[0]);
  });

  useEffect(() => {
    const unsub = subscribeToStorage(STORAGE_KEYS.WEATHER_CITY, (newVal) => {
      if (newVal && typeof newVal === 'object' && 'name' in newVal) {
        setSelectedCity(newVal as CityOption);
      }
    });
    return unsub;
  }, []);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<CityOption[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const loadData = useCallback(async (city: CityOption) => {
    setLoading(true);
    try {
      const data = await fetchWeather(city);
      setWeather(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedCity);
  }, [selectedCity, loadData]);

  const handleCitySelect = (city: CityOption) => {
    setSelectedCity(city);
    saveToStorage(STORAGE_KEYS.WEATHER_CITY, city);
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
          name: 'Lokasi Saya',
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

  const renderWeatherIcon = (code: number, className = 'w-6 h-6') => {
    if (code === 0) return <Sun className={`${className} text-amber-500`} />;
    if (code === 1 || code === 2) return <CloudSun className={`${className} text-amber-400`} />;
    if (code === 3) return <Cloud className={`${className} text-neutral-400`} />;
    if (code === 45 || code === 48) return <CloudFog className={`${className} text-neutral-400`} />;
    if (code >= 51 && code <= 55) return <CloudDrizzle className={`${className} text-blue-400`} />;
    if (code >= 61 && code <= 65) return <CloudRain className={`${className} text-blue-500`} />;
    if (code >= 71 && code <= 77) return <Snowflake className={`${className} text-sky-300`} />;
    if (code >= 95) return <CloudLightning className={`${className} text-amber-400`} />;
    return <CloudSun className={`${className} text-amber-400`} />;
  };

  return (
    <div className="flex flex-col gap-2.5 select-none text-xs">
      {/* City header with switcher */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-1 font-semibold text-neutral-800 dark:text-neutral-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          <span className="truncate max-w-[170px]">{selectedCity.name}</span>
          <span className="text-[10px] text-neutral-400 group-hover:text-blue-400 font-normal">
            (ganti)
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Gunakan Lokasi Saat Ini (GPS)"
            onClick={handleUseGeolocation}
            className="p-1 rounded text-neutral-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Muat Ulang Cuaca"
            onClick={() => loadData(selectedCity)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* City Search/Picker Dropdown Panel */}
      {showSearch && (
        <div className="p-2 rounded-lg bg-neutral-100/95 dark:bg-neutral-800/95 border border-black/10 dark:border-white/10 flex flex-col gap-2">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama kota dunia..."
                className="w-full text-xs pl-6 pr-2 py-1 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Search className="w-3 h-3 text-neutral-400 absolute left-2 top-2" />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-2 py-1 text-[11px] rounded bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSearching ? '...' : 'Cari'}
            </button>
          </form>

          {/* Search Results if any */}
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-1 max-h-24 overflow-y-auto border-b border-black/5 dark:border-white/5 pb-1">
              <span className="text-[10px] text-neutral-400 font-medium">Hasil Pencarian:</span>
              {searchResults.map((c, i) => (
                <button
                  key={`${c.name}-${i}`}
                  type="button"
                  onClick={() => handleCitySelect(c)}
                  className="text-left text-xs py-1 px-1.5 rounded hover:bg-blue-500/10 text-neutral-700 dark:text-neutral-200 flex items-center justify-between"
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[10px] text-neutral-400">{c.country}</span>
                </button>
              ))}
            </div>
          )}

          {/* Preset quick buttons */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 font-medium">Kota Populer:</span>
            <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
              {PRESET_CITIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleCitySelect(c)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                    selectedCity.name === c.name
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {selectedCity.name === c.name && <Check className="w-2.5 h-2.5" />}
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Temperature & Condition Display */}
      {weather && (
        <>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20">
                {renderWeatherIcon(weather.weatherCode, 'w-8 h-8')}
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    {weather.temp}°
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">C</span>
                </div>
                <div className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  {weather.condition}
                </div>
              </div>
            </div>

            {/* Humidity & Wind metrics */}
            <div className="flex flex-col gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5 justify-end">
                <Droplets className="w-3 h-3 text-blue-400" />
                <span>{weather.humidity}% Lembap</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Wind className="w-3 h-3 text-teal-400" />
                <span>{weather.windSpeed} km/h Angin</span>
              </div>
            </div>
          </div>

          {/* 4-Day Daily Forecast Strip */}
          {weather.daily && weather.daily.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 pt-2 border-t border-black/5 dark:border-white/5">
              {weather.daily.map((d, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center p-1.5 rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 text-center"
                >
                  <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-0.5">
                    {d.day}
                  </span>
                  <div className="my-0.5">{renderWeatherIcon(d.weatherCode, 'w-4 h-4')}</div>
                  <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-100">
                    {d.tempMax}°<span className="text-[9px] font-normal text-neutral-400 ml-0.5">{d.tempMin}°</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
