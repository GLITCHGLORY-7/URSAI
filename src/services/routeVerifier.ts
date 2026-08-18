import { RouteResult } from '../types/ursai';

export interface RouteVerificationResult {
  isValid: boolean;
  source: 'OSRM' | 'DIRECT_FALLBACK';
  pointsCount: number;
  distanceMeters: number;
  durationSeconds: number;
  error?: string;
}

export function verifyRouteCoordinates(coordinates: [number, number][]): { valid: boolean; error?: string } {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return { valid: false, error: 'Route coordinates list is empty or invalid array' };
  }

  for (let i = 0; i < coordinates.length; i++) {
    const pt = coordinates[i];
    if (!Array.isArray(pt) || pt.length < 2) {
      return { valid: false, error: `Invalid point at index ${i}` };
    }
    const [lat, lng] = pt;

    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
      return { valid: false, error: `Non-finite coordinate at index ${i}: [${lat}, ${lng}]` };
    }

    if (lat < -90 || lat > 90) {
      return { valid: false, error: `Latitude out of bounds [-90, 90] at index ${i}: ${lat}` };
    }

    if (lng < -180 || lng > 180) {
      return { valid: false, error: `Longitude out of bounds [-180, 180] at index ${i}: ${lng}` };
    }
  }

  return { valid: true };
}

export function verifyRouteData(route: RouteResult | null | undefined): RouteVerificationResult {
  if (!route) {
    return {
      isValid: false,
      source: 'DIRECT_FALLBACK',
      pointsCount: 0,
      distanceMeters: 0,
      durationSeconds: 0,
      error: 'Route object is null or undefined',
    };
  }

  const coordCheck = verifyRouteCoordinates(route.coordinates);
  if (!coordCheck.valid) {
    return {
      isValid: false,
      source: route.source === 'OSRM' ? 'OSRM' : 'DIRECT_FALLBACK',
      pointsCount: route.coordinates?.length || 0,
      distanceMeters: route.distanceMeters || 0,
      durationSeconds: route.durationSeconds || 0,
      error: coordCheck.error,
    };
  }

  if (route.distanceMeters <= 0) {
    return {
      isValid: false,
      source: route.source === 'OSRM' ? 'OSRM' : 'DIRECT_FALLBACK',
      pointsCount: route.coordinates.length,
      distanceMeters: route.distanceMeters,
      durationSeconds: route.durationSeconds,
      error: 'Route distance must be greater than zero',
    };
  }

  if (route.durationSeconds <= 0) {
    return {
      isValid: false,
      source: route.source === 'OSRM' ? 'OSRM' : 'DIRECT_FALLBACK',
      pointsCount: route.coordinates.length,
      distanceMeters: route.distanceMeters,
      durationSeconds: route.durationSeconds,
      error: 'Route duration must be greater than zero',
    };
  }

  return {
    isValid: true,
    source: route.source === 'OSRM' ? 'OSRM' : 'DIRECT_FALLBACK',
    pointsCount: route.coordinates.length,
    distanceMeters: route.distanceMeters,
    durationSeconds: route.durationSeconds,
  };
}
