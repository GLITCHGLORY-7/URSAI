import { NormalizedTrafficData, DataSourceMode, UrsaiState } from '../../types/ursai';
import { realDataSource } from './realDataSource';
import { simulatedDataSource } from './simulatedDataSource';
import { fallbackDataSource } from './fallbackDataSource';

export function getTrafficData(state: UrsaiState, mode: DataSourceMode = 'HYBRID'): NormalizedTrafficData {
  if (mode === 'REAL' || mode === 'HYBRID') {
    const real = realDataSource.getTrafficData(state);
    if (real) return real;
  }

  if (mode === 'FALLBACK') {
    return fallbackDataSource.getTrafficData(state);
  }

  try {
    return simulatedDataSource.getTrafficData(state);
  } catch {
    return fallbackDataSource.getTrafficData(state);
  }
}
