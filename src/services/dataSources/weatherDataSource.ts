import { NormalizedWeatherData, DataSourceMode, UrsaiState } from '../../types/ursai';
import { realDataSource } from './realDataSource';
import { simulatedDataSource } from './simulatedDataSource';
import { fallbackDataSource } from './fallbackDataSource';

export async function getWeatherData(state: UrsaiState, mode: DataSourceMode = 'HYBRID'): Promise<NormalizedWeatherData> {
  if (mode === 'REAL' || mode === 'HYBRID') {
    const real = await realDataSource.fetchRealWeather();
    if (real) return real;
  }

  if (mode === 'FALLBACK') {
    return fallbackDataSource.getWeatherData(state);
  }

  try {
    return simulatedDataSource.getWeatherData(state);
  } catch {
    return fallbackDataSource.getWeatherData(state);
  }
}
