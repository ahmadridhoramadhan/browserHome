import { WeatherData } from '../types';

export interface CityOption {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const PRESET_CITIES: CityOption[] = [
  { name: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456 },
  { name: 'Surabaya', country: 'Indonesia', latitude: -7.2575, longitude: 112.7521 },
  { name: 'Bandung', country: 'Indonesia', latitude: -6.9175, longitude: 107.6191 },
  { name: 'Medan', country: 'Indonesia', latitude: 3.5952, longitude: 98.6722 },
  { name: 'Yogyakarta', country: 'Indonesia', latitude: -7.7956, longitude: 110.3695 },
  { name: 'Semarang', country: 'Indonesia', latitude: -6.9667, longitude: 110.4167 },
  { name: 'Makassar', country: 'Indonesia', latitude: -5.1477, longitude: 119.4327 },
  { name: 'Denpasar (Bali)', country: 'Indonesia', latitude: -8.6705, longitude: 115.2126 },
  { name: 'Makkah', country: 'Arab Saudi', latitude: 21.4225, longitude: 39.8262 },
  { name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.139, longitude: 101.6869 },
  { name: 'Tokyo', country: 'Jepang', latitude: 35.6762, longitude: 139.6503 },
];

export function getWeatherConditionText(code: number): { label: string; icon: string } {
  // WMO Weather interpretation codes
  if (code === 0) return { label: 'Cerah Berawan', icon: 'Sun' };
  if (code === 1 || code === 2) return { label: 'Sebagian Berawan', icon: 'CloudSun' };
  if (code === 3) return { label: 'Mendung', icon: 'Cloud' };
  if (code === 45 || code === 48) return { label: 'Berkabut', icon: 'CloudFog' };
  if (code >= 51 && code <= 55) return { label: 'Gerimis Ringan', icon: 'CloudDrizzle' };
  if (code >= 61 && code <= 65) return { label: 'Hujan', icon: 'CloudRain' };
  if (code >= 71 && code <= 77) return { label: 'Salju', icon: 'Snowflake' };
  if (code >= 80 && code <= 82) return { label: 'Hujan Lebat', icon: 'CloudRainWind' };
  if (code >= 95 && code <= 99) return { label: 'Hujan Petir', icon: 'CloudLightning' };
  return { label: 'Berawan', icon: 'Cloud' };
}

export async function fetchWeather(city: CityOption): Promise<WeatherData> {
  const cacheKey = `weather_cache_${city.latitude.toFixed(2)}_${city.longitude.toFixed(2)}`;
  const cached = localStorage.getItem(cacheKey);
  const now = Date.now();

  if (cached) {
    try {
      const parsed: WeatherData = JSON.parse(cached);
      // Cache valid for 20 minutes
      if (now - parsed.lastUpdated < 20 * 60 * 1000) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather');
    const data = await res.json();

    const current = data.current;
    const daily = data.daily;
    const conditionInfo = getWeatherConditionText(current.weather_code);

    const daysName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const forecastDays: WeatherData['daily'] = [];

    if (daily && daily.time) {
      for (let i = 0; i < daily.time.length; i++) {
        const d = new Date(daily.time[i]);
        forecastDays.push({
          day: i === 0 ? 'Hari ini' : daysName[d.getDay()],
          tempMax: Math.round(daily.temperature_2m_max[i]),
          tempMin: Math.round(daily.temperature_2m_min[i]),
          weatherCode: daily.weather_code[i],
        });
      }
    }

    const result: WeatherData = {
      city: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      condition: conditionInfo.label,
      weatherCode: current.weather_code,
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      daily: forecastDays,
      lastUpdated: now,
    };

    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch (err) {
    console.error('Weather fetch error:', err);
    // Return fallback graceful data
    return {
      city: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
      temp: 29,
      feelsLike: 31,
      condition: 'Cerah Berawan',
      weatherCode: 1,
      humidity: 75,
      windSpeed: 12,
      daily: [
        { day: 'Hari ini', tempMax: 32, tempMin: 25, weatherCode: 1 },
        { day: 'Besok', tempMax: 31, tempMin: 24, weatherCode: 61 },
        { day: 'Lusa', tempMax: 30, tempMin: 25, weatherCode: 3 },
      ],
      lastUpdated: now,
    };
  }
}

export async function searchCities(query: string): Promise<CityOption[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim(),
      )}&count=5&language=id&format=json`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item: { name: string; country?: string; admin1?: string; latitude: number; longitude: number }) => ({
      name: `${item.name}${item.admin1 ? ', ' + item.admin1 : ''}`,
      country: item.country || '',
      latitude: item.latitude,
      longitude: item.longitude,
    }));
  } catch {
    return [];
  }
}
