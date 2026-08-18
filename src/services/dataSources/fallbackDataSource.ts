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

export class FallbackDataSource {
  public getTrafficData(_state: UrsaiState): NormalizedTrafficData {
    return normalizeTrafficData(
      {
        congestionIndex: 0.5,
        averageSpeedKmh: 30,
        overallLevel: 'MEDIUM',
        timestamp: new Date().toISOString(),
      },
      'FALLBACK',
      'Deterministic Safety Fallback'
    );
  }

  public getWeatherData(_state: UrsaiState): NormalizedWeatherData {
    return normalizeWeatherData(
      {
        condition: 'CLEAR',
        temperatureC: 30.0,
        visibilityKm: 10.0,
        windSpeedKmh: 10.0,
        timestamp: new Date().toISOString(),
      },
      'FALLBACK',
      'Deterministic Safety Fallback'
    );
  }

  public getHospitalData(state: UrsaiState): NormalizedHospitalData[] {
    const hospitals = state.hospital?.allHospitals || [];
    return hospitals.map((h) =>
      normalizeHospitalData(
        {
          id: h.id,
          name: h.name,
          latitude: h.latitude,
          longitude: h.longitude,
          bedsAvailable: 10,
          icuBedsAvailable: 2,
          emergencyReadiness: true,
          timestamp: new Date().toISOString(),
        },
        'FALLBACK',
        'Deterministic Safety Fallback'
      )
    );
  }

  public getResourceData(_state: UrsaiState): NormalizedResourceData {
    return normalizeResourceData(
      {
        ambulancesAvailable: 2,
        policeUnitsAvailable: 2,
        trafficUnitsAvailable: 4,
        timestamp: new Date().toISOString(),
      },
      'FALLBACK',
      'Deterministic Safety Fallback'
    );
  }

  public getRoadData(state: UrsaiState): NormalizedRoadData {
    const roads = state.cityState?.roads || [];
    return normalizeRoadData(roads, 'FALLBACK', 'Deterministic Safety Fallback');
  }
}

export const fallbackDataSource = new FallbackDataSource();
