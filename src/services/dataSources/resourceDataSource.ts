import { NormalizedResourceData, DataSourceMode, UrsaiState } from '../../types/ursai';
import { realDataSource } from './realDataSource';
import { simulatedDataSource } from './simulatedDataSource';
import { fallbackDataSource } from './fallbackDataSource';

export function getResourceData(state: UrsaiState, mode: DataSourceMode = 'HYBRID'): NormalizedResourceData {
  if (mode === 'REAL') {
    const real = realDataSource.getResourceData(state);
    if (real) return real;
  }

  if (mode === 'FALLBACK') {
    return fallbackDataSource.getResourceData(state);
  }

  try {
    return simulatedDataSource.getResourceData(state);
  } catch {
    return fallbackDataSource.getResourceData(state);
  }
}
