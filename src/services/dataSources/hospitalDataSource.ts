import { NormalizedHospitalData, DataSourceMode, UrsaiState } from '../../types/ursai';
import { realDataSource } from './realDataSource';
import { simulatedDataSource } from './simulatedDataSource';
import { fallbackDataSource } from './fallbackDataSource';

export function getHospitalData(state: UrsaiState, mode: DataSourceMode = 'HYBRID'): NormalizedHospitalData[] {
  if (mode === 'REAL') {
    const real = realDataSource.getHospitalData(state);
    if (real && real.length > 0) return real;
  }

  if (mode === 'FALLBACK') {
    return fallbackDataSource.getHospitalData(state);
  }

  try {
    return simulatedDataSource.getHospitalData(state);
  } catch {
    return fallbackDataSource.getHospitalData(state);
  }
}
