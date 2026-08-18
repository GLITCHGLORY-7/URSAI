import { RoadSegment, TrafficCityData, TrafficLevel } from '../types/ursai';

export const INITIAL_ROAD_SEGMENTS: RoadSegment[] = [
  {
    id: 'ROAD-01',
    name: 'Anna Salai Primary Corridor',
    status: 'NORMAL',
    congestionIndex: 0.32,
    averageSpeedKmh: 42,
    blocked: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ROAD-02',
    name: 'Poonamallee High Road Transit',
    status: 'NORMAL',
    congestionIndex: 0.28,
    averageSpeedKmh: 45,
    blocked: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ROAD-03',
    name: 'GST Road Arterial Route',
    status: 'NORMAL',
    congestionIndex: 0.25,
    averageSpeedKmh: 50,
    blocked: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ROAD-04',
    name: 'Inner Ring Road Sector 4',
    status: 'NORMAL',
    congestionIndex: 0.20,
    averageSpeedKmh: 55,
    blocked: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ROAD-05',
    name: 'Kamarajar Salai Coastal Expressway',
    status: 'NORMAL',
    congestionIndex: 0.18,
    averageSpeedKmh: 58,
    blocked: false,
    updatedAt: new Date().toISOString(),
  },
];

export function getTrafficLevelFromIndex(index: number): TrafficLevel {
  if (index >= 0.75) return 'CRITICAL';
  if (index >= 0.50) return 'HIGH';
  if (index >= 0.25) return 'MEDIUM';
  return 'LOW';
}

export function computeSimulatedTraffic(
  currentRoads: RoadSegment[],
  hasActiveIncident: boolean,
  isGreenCorridorActive: boolean,
  incidentSeverity?: string
): { traffic: TrafficCityData; roads: RoadSegment[] } {
  let baseCongestion = 0.28;

  if (hasActiveIncident) {
    if (incidentSeverity === 'CRITICAL') baseCongestion += 0.38;
    else if (incidentSeverity === 'HIGH') baseCongestion += 0.28;
    else baseCongestion += 0.18;
  }

  if (isGreenCorridorActive) {
    // Corridor clears main path, slightly shifts backpressure to peripheral roads
    baseCongestion = Math.max(0.15, baseCongestion - 0.10);
  }

  // Smoothly update road segments with slight deterministic variation
  const updatedRoads: RoadSegment[] = currentRoads.map((road, idx) => {
    let roadCongestion = baseCongestion;
    if (idx === 0 && hasActiveIncident) {
      roadCongestion = Math.min(0.95, roadCongestion + 0.18); // Incident primary road
    } else if (idx === 1 && isGreenCorridorActive) {
      roadCongestion = Math.max(0.10, roadCongestion - 0.12); // Cleared priority segment
    }

    // Clamp 0.0 - 1.0
    roadCongestion = Math.max(0.05, Math.min(0.98, roadCongestion));
    const level = getTrafficLevelFromIndex(roadCongestion);

    let status: RoadSegment['status'] = 'NORMAL';
    if (isGreenCorridorActive && idx === 1) status = 'EMERGENCY_CORRIDOR';
    else if (roadCongestion >= 0.75) status = 'CONGESTED';
    else if (roadCongestion >= 0.50) status = 'CONGESTED';

    const avgSpeed = Math.round(60 * (1 - roadCongestion * 0.7));

    return {
      ...road,
      congestionIndex: Number(roadCongestion.toFixed(2)),
      averageSpeedKmh: Math.max(10, avgSpeed),
      status,
      updatedAt: new Date().toISOString(),
    };
  });

  const totalIndex = updatedRoads.reduce((acc, r) => acc + r.congestionIndex, 0) / updatedRoads.length;
  const overallLevel = getTrafficLevelFromIndex(totalIndex);
  const averageSpeedKmh = Math.round(
    updatedRoads.reduce((acc, r) => acc + r.averageSpeedKmh, 0) / updatedRoads.length
  );

  return {
    traffic: {
      overallLevel,
      averageSpeedKmh,
      congestionIndex: Number(totalIndex.toFixed(2)),
    },
    roads: updatedRoads,
  };
}
