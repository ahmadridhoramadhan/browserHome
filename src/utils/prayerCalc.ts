import { PrayerData, PrayerTime } from '../types';
import { CityOption } from './weatherApi';

// Astronomical calculation for offline fallback & instant computation
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180.0;
}

function radToDeg(rad: number): number {
  return (rad * 180.0) / Math.PI;
}

export function calculateOfflinePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  timezoneOffsetHours: number,
): Record<string, string> {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
  );

  // Solar declination & Equation of Time
  const B = (360 / 365) * (dayOfYear - 81);
  const B_rad = degToRad(B);
  const EoT = 9.87 * Math.sin(2 * B_rad) - 7.53 * Math.cos(B_rad) - 1.5 * Math.sin(B_rad); // minutes
  const delta = 23.45 * Math.sin(degToRad(B)); // degrees

  // Solar Noon (Dzuhur) in local time
  const solarNoon = 12 + (timezoneOffsetHours * 15 - lng) / 15 - EoT / 60;

  // Angles for KEMENAG / SE Asia: Fajr (Subuh) = -20°, Isha = -18°
  const calcHourAngle = (altitudeDeg: number) => {
    const latRad = degToRad(lat);
    const deltaRad = degToRad(delta);
    const altRad = degToRad(altitudeDeg);
    const cosHA =
      (Math.sin(altRad) - Math.sin(latRad) * Math.sin(deltaRad)) /
      (Math.cos(latRad) * Math.cos(deltaRad));
    if (cosHA > 1 || cosHA < -1) return 0;
    return radToDeg(Math.acos(cosHA)) / 15;
  };

  const sunriseHA = calcHourAngle(-0.833);
  const fajrHA = calcHourAngle(-20);
  const ishaHA = calcHourAngle(-18);

  // Asr (Shafi'i shadow factor = 1)
  const asrAltRad = Math.atan(1 + Math.tan(Math.abs(degToRad(lat - delta))));
  const asrAltDeg = radToDeg(asrAltRad);
  const asrHA = calcHourAngle(asrAltDeg);

  const formatHours = (hours: number): string => {
    let h = Math.floor(hours) % 24;
    let m = Math.floor((hours - Math.floor(hours)) * 60);
    if (m < 0) {
      m += 60;
      h -= 1;
    }
    if (h < 0) h += 24;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const dzuhurH = solarNoon + 2 / 60; // 2 min ihtiyat (safety)
  const asrH = solarNoon + asrHA + 2 / 60;
  const maghribH = solarNoon + sunriseHA + 3 / 60;
  const ishaH = solarNoon + ishaHA + 2 / 60;
  const sunriseH = solarNoon - sunriseHA;
  const subuhH = solarNoon - fajrHA + 2 / 60;
  const imsakH = subuhH - 10 / 60;

  return {
    Imsak: formatHours(imsakH),
    Subuh: formatHours(subuhH),
    Terbit: formatHours(sunriseH),
    Dzuhur: formatHours(dzuhurH),
    Ashar: formatHours(asrH),
    Maghrib: formatHours(maghribH),
    Isya: formatHours(ishaH),
  };
}

export function getTimezoneLabel(tzString?: string, longitude?: number): string {
  if (tzString) {
    if (tzString.includes('Jakarta') || tzString.includes('Pontianak') || tzString === 'Asia/Bangkok') return 'WIB';
    if (tzString.includes('Makassar') || tzString.includes('Ujung_Pandang') || tzString.includes('Bali') || tzString.includes('Kuala_Lumpur') || tzString.includes('Singapore')) return 'WITA';
    if (tzString.includes('Jayapura')) return 'WIT';
    if (tzString.includes('Riyadh')) return 'AST';
  }
  if (longitude !== undefined) {
    if (longitude >= 95 && longitude < 115) return 'WIB';
    if (longitude >= 115 && longitude < 125) return 'WITA';
    if (longitude >= 125 && longitude <= 141) return 'WIT';
  }
  return '';
}

export async function fetchPrayerTimes(city: CityOption, date: Date = new Date()): Promise<PrayerData> {
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
  const cacheKey = `prayer_cache_${city.latitude.toFixed(2)}_${city.longitude.toFixed(2)}_${dateKey}`;
  const cached = localStorage.getItem(cacheKey);

  let rawTimes: Record<string, string> | null = null;
  let timezone: string = '';

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.timings) {
        rawTimes = parsed.timings;
        timezone = parsed.timezone || '';
      } else {
        // legacy cache format
        rawTimes = parsed;
      }
    } catch {
      // ignore
    }
  }

  if (!rawTimes) {
    try {
      const timestamp = Math.floor(date.getTime() / 1000);
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${city.latitude}&longitude=${city.longitude}&method=11`,
      );
      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.timings) {
          const t = json.data.timings;
          timezone = json.data.meta?.timezone || '';
          rawTimes = {
            Imsak: t.Imsak?.substring(0, 5) || '04:20',
            Subuh: t.Fajr?.substring(0, 5) || '04:35',
            Terbit: t.Sunrise?.substring(0, 5) || '05:50',
            Dzuhur: t.Dhuhr?.substring(0, 5) || '11:58',
            Ashar: t.Asr?.substring(0, 5) || '15:15',
            Maghrib: t.Maghrib?.substring(0, 5) || '18:00',
            Isya: t.Isha?.substring(0, 5) || '19:10',
          };
          localStorage.setItem(cacheKey, JSON.stringify({ timings: rawTimes, timezone }));
        }
      }
    } catch {
      // Fall through to offline calculation
    }
  }

  // Fallback to offline calculation if API fails
  if (!rawTimes) {
    const tzOffsetHours = -date.getTimezoneOffset() / 60;
    rawTimes = calculateOfflinePrayerTimes(date, city.latitude, city.longitude, tzOffsetHours);
    localStorage.setItem(cacheKey, JSON.stringify({ timings: rawTimes, timezone }));
  }

  const prayerDefs = [
    { name: 'Imsak', label: 'Imsak' },
    { name: 'Subuh', label: 'Subuh' },
    { name: 'Terbit', label: 'Terbit' },
    { name: 'Dzuhur', label: 'Dzuhur' },
    { name: 'Ashar', label: 'Ashar' },
    { name: 'Maghrib', label: 'Maghrib' },
    { name: 'Isya', label: 'Isya' },
  ];

  const now = date.getTime();
  const todayYMD = {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };

  const times: PrayerTime[] = prayerDefs.map((def) => {
    const timeStr = rawTimes![def.name] || '00:00';
    const [h, m] = timeStr.split(':').map(Number);
    const pDate = new Date(todayYMD.year, todayYMD.month, todayYMD.day, h, m, 0);
    return {
      name: def.name,
      label: def.label,
      time: timeStr,
      timestamp: pDate.getTime(),
    };
  });

  // Determine next upcoming prayer
  let nextPrayerInfo: PrayerData['nextPrayer'] = null;
  for (const p of times) {
    if (p.timestamp > now) {
      const diffMin = Math.round((p.timestamp - now) / 60000);
      nextPrayerInfo = {
        name: p.name,
        label: p.label,
        time: p.time,
        remainingMinutes: diffMin,
      };
      p.isNext = true;
      break;
    }
  }

  // If all prayers today have passed, next is tomorrow's Subuh/Imsak
  if (!nextPrayerInfo && times.length > 0) {
    const firstPrayer = times[0]; // Imsak
    const [h, m] = firstPrayer.time.split(':').map(Number);
    const tomorrowDate = new Date(todayYMD.year, todayYMD.month, todayYMD.day + 1, h, m, 0);
    const diffMin = Math.round((tomorrowDate.getTime() - now) / 60000);
    nextPrayerInfo = {
      name: firstPrayer.name,
      label: firstPrayer.label,
      time: firstPrayer.time,
      remainingMinutes: diffMin,
    };
  }

  return {
    city: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone,
    times,
    nextPrayer: nextPrayerInfo,
  };
}
