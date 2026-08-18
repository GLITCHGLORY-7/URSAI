import { RouteResult } from '../types/ursai';

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

// In-memory cache for routes
const routeCache = new Map<string, RouteResult>();

function getCacheKey(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): string {
  return `${startLat.toFixed(4)},${startLng.toFixed(4)}->${endLat.toFixed(4)},${endLng.toFixed(4)}`;
}

/**
 * Calculates Haversine distance in meters between two lat/lng coordinates
 */
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Generates direct interpolated fallback route when OSRM is unreachable or fails
 */
function generateFallbackRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): RouteResult {
  const distanceMeters = calculateHaversineDistance(
    startLat,
    startLng,
    endLat,
    endLng
  );

  // Estimate duration assuming average city speed of 40 km/h (~11.1 m/s)
  const durationSeconds = Math.max(10, Math.round(distanceMeters / 11.1));

  // Generate 15 intermediate points along direct path
  const STEPS = 15;
  const coordinates: [number, number][] = [];

  for (let i = 0; i <= STEPS; i++) {
    const fraction = i / STEPS;
    const lat = startLat + (endLat - startLat) * fraction;
    const lng = startLng + (endLng - startLng) * fraction;
    coordinates.push([lat, lng]);
  }

  return {
    coordinates,
    distanceMeters,
    durationSeconds,
    source: 'FALLBACK',
  };
}

/**
 * Fetches driving route from OSRM with timeout, fallback, and cancellation support.
 */
export async function fetchRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  signal?: AbortSignal
): Promise<RouteResult> {
  const cacheKey = getCacheKey(startLat, startLng, endLat, endLng);
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  // OSRM format: /driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson
  const url = `${OSRM_BASE_URL}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 6000); // 6s timeout

  // Combine parent abort signal if provided
  const onAbort = () => timeoutController.abort();
  if (signal) {
    signal.addEventListener('abort', onAbort);
  }

  try {
    const response = await fetch(url, {
      signal: timeoutController.signal,
    });

    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', onAbort);
    }

    if (!response.ok) {
      throw new Error(`OSRM HTTP error status ${response.status}`);
    }

    const data = await response.json();

    if (
      !data.routes ||
      !Array.isArray(data.routes) ||
      data.routes.length === 0
    ) {
      throw new Error('OSRM returned no valid route geometry');
    }

    const primaryRoute = data.routes[0];
    const geoJsonCoords: [number, number][] = primaryRoute.geometry.coordinates;

    // GeoJSON is [longitude, latitude]. Leaflet polyline expects [latitude, longitude].
    const coordinates: [number, number][] = geoJsonCoords.map(
      ([lng, lat]) => [lat, lng]
    );

    const result: RouteResult = {
      coordinates,
      distanceMeters: Math.round(primaryRoute.distance),
      durationSeconds: Math.round(primaryRoute.duration),
      source: 'OSRM',
    };

    routeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', onAbort);
    }

    // Check if error was explicit user cancellation
    if (signal && signal.aborted) {
      throw new Error('Routing request cancelled');
    }

    console.warn('OSRM routing request failed or timed out. Using fallback path.', error);

    // Return direct path fallback
    const fallback = generateFallbackRoute(
      startLat,
      startLng,
      endLat,
      endLng
    );
    return fallback;
  }
}
