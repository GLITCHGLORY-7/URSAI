import {
  NormalizedTrafficData,
  NormalizedWeatherData,
  NormalizedHospitalData,
  NormalizedResourceData,
  NormalizedRoadData,
  UrsaiState,
} from '../../types/ursai';
import {
  normalizeTrafficData,
  normalizeWeatherData,
  normalizeHospitalData,
  normalizeResourceData,
  normalizeRoadData,
} from '../dataNormalizer';
import { logger } from '../logger';
import { eventBus } from '../eventBus';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class RealDataSource {
  private weatherCache: CacheEntry<NormalizedWeatherData> | null = null;
  private weatherTtlMs = 5 * 60 * 1000; // 5 minutes

  private trafficCache: CacheEntry<NormalizedTrafficData> | null = null;
  private trafficTtlMs = 30 * 1000; // 30 seconds

  private isWeatherConnected = false;
  private isTrafficConnected = false;

  /**
   * Attempts to fetch real weather data if configured (e.g. Open-Meteo or custom weather endpoint for Chennai).
   */
  public async fetchRealWeather(): Promise<NormalizedWeatherData | null> {
    const weatherUrl =
      typeof import.meta !== 'undefined'
        ? (import.meta as any).env?.VITE_WEATHER_API_URL
        : null;

    // Default public real-time weather API for Chennai (13.0827, 80.2707) via Open-Meteo if no custom endpoint provided
    const targetUrl =
      weatherUrl ||
      'https://api.open-meteo.com/v1/forecast?latitude=13.0827&longitude=80.2707&current=temperature_2m,relative_humidity_2m,rain,weather_code,wind_speed_10m&wind_speed_unit=ms';

    if (this.weatherCache && Date.now() - this.weatherCache.timestamp < this.weatherTtlMs) {
      return this.weatherCache.data;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Weather API returned status ${response.status}`);
      }

      const json = await response.json();
      const current = json.current || json;

      const tempC = current.temperature_2m ?? 31.0;
      const rain = current.rain ?? 0;
      const wind = current.wind_speed_10m ? Math.round(current.wind_speed_10m * 3.6) : 12;

      let cond: 'CLEAR' | 'CLOUDY' | 'LIGHT_RAIN' | 'HEAVY_RAIN' = 'CLEAR';
      if (rain > 5) cond = 'HEAVY_RAIN';
      else if (rain > 0.1) cond = 'LIGHT_RAIN';
      else if (current.relative_humidity_2m > 80) cond = 'CLOUDY';

      const normalized = normalizeWeatherData(
        {
          condition: cond,
          temperatureC: tempC,
          visibilityKm: cond === 'HEAVY_RAIN' ? 4.0 : 10.0,
          windSpeedKmh: wind,
          timestamp: new Date().toISOString(),
        },
        'REAL',
        'Open-Meteo Real-Time Weather'
      );

      this.weatherCache = { data: normalized, timestamp: Date.now() };

      if (!this.isWeatherConnected) {
        this.isWeatherConnected = true;
        eventBus.publish('DATA_SOURCE_CONNECTED', { category: 'Weather', provider: normalized.provider }, 'REAL_DATA_SOURCE');
      }

      return normalized;
    } catch (err: any) {
      if (this.isWeatherConnected) {
        this.isWeatherConnected = false;
        eventBus.publish('DATA_SOURCE_FAILED', { category: 'Weather', error: err.message }, 'REAL_DATA_SOURCE');
      }
      logger.warn('[RealDataSource] Failed to fetch real weather data, fallback required', { error: err.message });
      return null;
    }
  }

  public getTrafficData(_state: UrsaiState): NormalizedTrafficData | null {
    // If real traffic URL configured, return cached/fetched traffic or null
    return this.trafficCache?.data || null;
  }

  public getWeatherData(_state: UrsaiState): NormalizedWeatherData | null {
    return this.weatherCache?.data || null;
  }

  public getHospitalData(_state: UrsaiState): NormalizedHospitalData[] | null {
    // Real hospital read-only API adapter placeholder (returns null if no real API connected)
    return null;
  }

  public getResourceData(_state: UrsaiState): NormalizedResourceData | null {
    return null;
  }

  public getRoadData(_state: UrsaiState): NormalizedRoadData | null {
    return null;
  }
}

export const realDataSource = new RealDataSource();
