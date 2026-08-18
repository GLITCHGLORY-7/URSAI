import {
  NormalizedTrafficData,
  NormalizedWeatherData,
  NormalizedHospitalData,
  NormalizedResourceData,
  NormalizedRoadData,
  TrafficLevel,
  WeatherCondition,
  RoadSegment,
  DataSourceType,
  DataFreshness,
} from '../types/ursai';
import { logger } from './logger';
import { eventBus } from './eventBus';

/**
 * Validates basic ISO timestamp strings.
 */
export function isValidISODate(str: any): boolean {
  if (typeof str !== 'string' || !str) return false;
  const date = new Date(str);
  return !isNaN(date.getTime());
}

/**
 * Validates coordinate bounding box for Chennai region [-90 to 90, -180 to 180].
 */
export function isValidCoordinates(lat: any, lng: any): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Normalizes and validates raw traffic payloads.
 */
export function normalizeTrafficData(
  raw: any,
  source: DataSourceType = 'SIMULATED',
  provider: string = 'Simulated Traffic Engine'
): NormalizedTrafficData {
  const timestamp = isValidISODate(raw?.timestamp) ? raw.timestamp : new Date().toISOString();

  let congestionIndex = typeof raw?.congestionIndex === 'number' ? raw.congestionIndex : 0.25;
  if (isNaN(congestionIndex) || congestionIndex < 0 || congestionIndex > 1) {
    logger.warn('[DataNormalizer] Invalid congestionIndex, normalizing to 0.25', { rawCongestion: raw?.congestionIndex });
    eventBus.publish('DATA_VALIDATION_FAILED', { field: 'congestionIndex', raw: raw?.congestionIndex }, 'DATA_NORMALIZER');
    congestionIndex = 0.25;
  }

  let averageSpeedKmh = typeof raw?.averageSpeedKmh === 'number' && raw.averageSpeedKmh >= 0 ? raw.averageSpeedKmh : 45;
  let affectedRoadsCount = typeof raw?.affectedRoadsCount === 'number' && raw.affectedRoadsCount >= 0 ? raw.affectedRoadsCount : 0;

  let overallLevel: TrafficLevel = 'LOW';
  if (congestionIndex > 0.75) overallLevel = 'CRITICAL';
  else if (congestionIndex > 0.5) overallLevel = 'HIGH';
  else if (congestionIndex > 0.3) overallLevel = 'MEDIUM';

  const freshness: DataFreshness = source === 'SIMULATED' ? 'SIMULATED' : 'FRESH';

  return {
    congestionIndex,
    overallLevel,
    averageSpeedKmh,
    affectedRoadsCount,
    timestamp,
    source,
    freshness,
    provider,
  };
}

/**
 * Normalizes and validates raw weather payloads.
 */
export function normalizeWeatherData(
  raw: any,
  source: DataSourceType = 'SIMULATED',
  provider: string = 'Simulated Weather Engine'
): NormalizedWeatherData {
  const timestamp = isValidISODate(raw?.timestamp) ? raw.timestamp : new Date().toISOString();

  const validConditions: WeatherCondition[] = ['CLEAR', 'CLOUDY', 'LIGHT_RAIN', 'HEAVY_RAIN'];
  let condition: WeatherCondition = validConditions.includes(raw?.condition) ? raw.condition : 'CLEAR';

  let temperatureC = typeof raw?.temperatureC === 'number' && raw.temperatureC >= -50 && raw.temperatureC <= 60 ? raw.temperatureC : 31.0;
  let visibilityKm = typeof raw?.visibilityKm === 'number' && raw.visibilityKm >= 0 ? raw.visibilityKm : 10.0;
  let windSpeedKmh = typeof raw?.windSpeedKmh === 'number' && raw.windSpeedKmh >= 0 ? raw.windSpeedKmh : 12.0;

  let rainIntensity: 'NONE' | 'LIGHT' | 'HEAVY' = 'NONE';
  if (condition === 'LIGHT_RAIN') rainIntensity = 'LIGHT';
  if (condition === 'HEAVY_RAIN') rainIntensity = 'HEAVY';

  const freshness: DataFreshness = source === 'SIMULATED' ? 'SIMULATED' : 'FRESH';

  return {
    condition,
    temperatureC,
    visibilityKm,
    windSpeedKmh,
    rainIntensity,
    timestamp,
    source,
    freshness,
    provider,
  };
}

/**
 * Normalizes and validates raw hospital payloads.
 */
export function normalizeHospitalData(
  raw: any,
  source: DataSourceType = 'SIMULATED',
  provider: string = 'Simulated Hospital Registry'
): NormalizedHospitalData {
  const hospitalId = typeof raw?.id === 'string' || typeof raw?.hospitalId === 'string' ? String(raw.id || raw.hospitalId) : 'HOSP-UNK';
  const name = typeof raw?.name === 'string' ? raw.name : 'Emergency Facility';

  let lat = raw?.latitude;
  let lng = raw?.longitude;
  if (!isValidCoordinates(lat, lng)) {
    logger.warn(`[DataNormalizer] Invalid hospital coordinates for ${name}, using Chennai central fallback`, { lat, lng });
    eventBus.publish('DATA_VALIDATION_FAILED', { field: 'hospitalCoordinates', hospitalId }, 'DATA_NORMALIZER');
    lat = 13.0827;
    lng = 80.2707;
  }

  const bedsAvailable = typeof raw?.bedsAvailable === 'number' && raw.bedsAvailable >= 0 ? raw.bedsAvailable : 20;
  const icuBedsAvailable = typeof raw?.icuBedsAvailable === 'number' && raw.icuBedsAvailable >= 0 ? raw.icuBedsAvailable : 5;
  const emergencyReadiness = typeof raw?.emergencyReadiness === 'boolean' ? raw.emergencyReadiness : true;

  const timestamp = isValidISODate(raw?.timestamp) ? raw.timestamp : new Date().toISOString();
  const freshness: DataFreshness = source === 'SIMULATED' ? 'SIMULATED' : 'FRESH';

  return {
    hospitalId,
    name,
    latitude: lat,
    longitude: lng,
    bedsAvailable,
    icuBedsAvailable,
    emergencyReadiness,
    timestamp,
    source,
    freshness,
    provider,
  };
}

/**
 * Normalizes and validates resource state payloads.
 */
export function normalizeResourceData(
  raw: any,
  source: DataSourceType = 'SIMULATED',
  provider: string = 'Simulated Fleet Dispatcher'
): NormalizedResourceData {
  const ambulancesAvailable = typeof raw?.ambulancesAvailable === 'number' && raw.ambulancesAvailable >= 0 ? raw.ambulancesAvailable : 5;
  const policeUnitsAvailable = typeof raw?.policeUnitsAvailable === 'number' && raw.policeUnitsAvailable >= 0 ? raw.policeUnitsAvailable : 5;
  const trafficUnitsAvailable = typeof raw?.trafficUnitsAvailable === 'number' && raw.trafficUnitsAvailable >= 0 ? raw.trafficUnitsAvailable : 8;

  const timestamp = isValidISODate(raw?.timestamp) ? raw.timestamp : new Date().toISOString();
  const freshness: DataFreshness = source === 'SIMULATED' ? 'SIMULATED' : 'FRESH';

  return {
    ambulancesAvailable,
    policeUnitsAvailable,
    trafficUnitsAvailable,
    timestamp,
    source,
    freshness,
    provider,
  };
}

/**
 * Normalizes road segment array payloads.
 */
export function normalizeRoadData(
  roads: any[],
  source: DataSourceType = 'SIMULATED',
  provider: string = 'OpenStreetMap Chennai'
): NormalizedRoadData {
  const validRoads: RoadSegment[] = Array.isArray(roads)
    ? roads.map((r, i) => ({
        id: typeof r?.id === 'string' ? r.id : `road-${i}`,
        name: typeof r?.name === 'string' ? r.name : `Corridor ${i + 1}`,
        status: ['NORMAL', 'CONGESTED', 'BLOCKED', 'EMERGENCY_CORRIDOR'].includes(r?.status) ? r.status : 'NORMAL',
        congestionIndex: typeof r?.congestionIndex === 'number' && r.congestionIndex >= 0 && r.congestionIndex <= 1 ? r.congestionIndex : 0.2,
        averageSpeedKmh: typeof r?.averageSpeedKmh === 'number' && r.averageSpeedKmh >= 0 ? r.averageSpeedKmh : 40,
        blocked: Boolean(r?.blocked),
        updatedAt: isValidISODate(r?.updatedAt) ? r.updatedAt : new Date().toISOString(),
      }))
    : [];

  const timestamp = new Date().toISOString();
  const freshness: DataFreshness = source === 'SIMULATED' ? 'SIMULATED' : 'FRESH';

  return {
    roads: validRoads,
    timestamp,
    source,
    freshness,
    provider,
  };
}
