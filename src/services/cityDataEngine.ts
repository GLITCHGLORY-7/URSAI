import { UrsaiState, CityState, HospitalPressure } from '../types/ursai';
import { INITIAL_ROAD_SEGMENTS, computeSimulatedTraffic } from './simulatedTrafficService';
import { INITIAL_WEATHER_DATA, computeSimulatedWeather } from './simulatedWeatherService';
import { computeIncidentImpact } from './simulatedRoadService';

export const INITIAL_CITY_STATE: CityState = {
  timestamp: new Date().toISOString(),
  traffic: {
    overallLevel: 'LOW',
    averageSpeedKmh: 45,
    congestionIndex: 0.25,
  },
  weather: { ...INITIAL_WEATHER_DATA },
  roads: [...INITIAL_ROAD_SEGMENTS],
  resources: {
    ambulancesAvailable: 5,
    policeUnitsAvailable: 5,
  },
  hospitalPressure: 'LOW',
  affectedRoadsCount: 0,
};

/**
 * Derives resources directly from agent states to maintain a single source of truth.
 */
export function deriveResourceState(state: UrsaiState): { ambulancesAvailable: number; policeUnitsAvailable: number } {
  let ambulancesAvailable = 5;
  if (state.ambulance.status !== 'AVAILABLE') {
    ambulancesAvailable = Math.max(0, ambulancesAvailable - 1);
  }

  let policeUnitsAvailable = 5;
  if (state.police.status !== 'AVAILABLE') {
    policeUnitsAvailable = Math.max(0, policeUnitsAvailable - 1);
  }

  return { ambulancesAvailable, policeUnitsAvailable };
}

/**
 * Derives simulated hospital pressure from selected hospital capacity & severity.
 */
export function deriveHospitalPressure(state: UrsaiState): HospitalPressure {
  const hospital = state.hospital.selectedHospital;
  const incident = state.activeIncident;

  if (!incident || !hospital) return 'LOW';

  const icu = hospital.icuBedsAvailable ?? 15;
  const beds = hospital.bedsAvailable ?? 50;

  if (icu < 5 || beds < 10) return 'CRITICAL';
  if (icu < 12 || incident.severity === 'CRITICAL') return 'HIGH';
  if (icu < 20 || incident.severity === 'HIGH') return 'MEDIUM';
  return 'LOW';
}

/**
 * Computes a unified simulated CityState from the overall UrsaiState.
 */
export function computeCityState(state: UrsaiState): CityState {
  const hasIncident = Boolean(state.activeIncident && state.activeIncident.status !== 'RESOLVED');
  const isGreenCorridor = Boolean(state.traffic.greenCorridorActive);
  const severity = state.activeIncident?.severity;

  const { traffic, roads } = computeSimulatedTraffic(
    state.cityState?.roads || INITIAL_ROAD_SEGMENTS,
    hasIncident,
    isGreenCorridor,
    severity
  );

  const weather = computeSimulatedWeather(state.cityState?.weather || INITIAL_WEATHER_DATA);
  const resources = deriveResourceState(state);
  const hospitalPressure = deriveHospitalPressure(state);

  const impactZone = computeIncidentImpact(
    hasIncident,
    state.activeIncident?.id,
    severity,
    roads
  );

  return {
    timestamp: new Date().toISOString(),
    traffic,
    weather,
    roads,
    resources,
    hospitalPressure,
    affectedRoadsCount: impactZone ? impactZone.affectedRoadIds.length : 0,
  };
}
