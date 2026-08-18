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
import { computeSimulatedTraffic, INITIAL_ROAD_SEGMENTS } from '../simulatedTrafficService';
import { computeSimulatedWeather, INITIAL_WEATHER_DATA } from '../simulatedWeatherService';
import { deriveResourceState } from '../cityDataEngine';

export class SimulatedDataSource {
  public getTrafficData(state: UrsaiState): NormalizedTrafficData {
    const hasIncident = Boolean(state.activeIncident && state.activeIncident.status !== 'RESOLVED');
    const isGreenCorridor = Boolean(state.traffic.greenCorridorActive);
    const severity = state.activeIncident?.severity;

    const { traffic } = computeSimulatedTraffic(
      state.cityState?.roads || INITIAL_ROAD_SEGMENTS,
      hasIncident,
      isGreenCorridor,
      severity
    );

    return normalizeTrafficData(
      {
        congestionIndex: traffic.congestionIndex,
        averageSpeedKmh: traffic.averageSpeedKmh,
        overallLevel: traffic.overallLevel,
        timestamp: new Date().toISOString(),
      },
      'SIMULATED',
      'URSAI City Simulator'
    );
  }

  public getWeatherData(state: UrsaiState): NormalizedWeatherData {
    const weather = computeSimulatedWeather(state.cityState?.weather || INITIAL_WEATHER_DATA);
    return normalizeWeatherData(
      {
        condition: weather.condition,
        temperatureC: weather.temperatureC,
        visibilityKm: weather.visibilityKm,
        rainIntensity: weather.rainIntensity,
        timestamp: new Date().toISOString(),
      },
      'SIMULATED',
      'URSAI Climate Model'
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
          bedsAvailable: h.bedsAvailable,
          icuBedsAvailable: h.icuBedsAvailable,
          emergencyReadiness: h.emergencyReady,
          timestamp: new Date().toISOString(),
        },
        'SIMULATED',
        'URSAI Hospital Registry'
      )
    );
  }

  public getResourceData(state: UrsaiState): NormalizedResourceData {
    const resources = deriveResourceState(state);
    return normalizeResourceData(
      {
        ambulancesAvailable: resources.ambulancesAvailable,
        policeUnitsAvailable: resources.policeUnitsAvailable,
        trafficUnitsAvailable: 8,
        timestamp: new Date().toISOString(),
      },
      'SIMULATED',
      'URSAI Fleet Simulator'
    );
  }

  public getRoadData(state: UrsaiState): NormalizedRoadData {
    const roads = state.cityState?.roads || INITIAL_ROAD_SEGMENTS;
    return normalizeRoadData(roads, 'SIMULATED', 'OpenStreetMap Road Network');
  }
}

export const simulatedDataSource = new SimulatedDataSource();
