import { RoadSegment, RoadStatus } from '../types/ursai';

export interface IncidentImpactZone {
  incidentId: string;
  radiusKm: number;
  trafficImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedRoadIds: string[];
}

export function computeIncidentImpact(
  hasActiveIncident: boolean,
  incidentId?: string,
  severity?: string,
  roads: RoadSegment[] = []
): IncidentImpactZone | null {
  if (!hasActiveIncident || !incidentId) return null;

  let radiusKm = 1.5;
  let trafficImpact: IncidentImpactZone['trafficImpact'] = 'MEDIUM';
  if (severity === 'CRITICAL') {
    radiusKm = 3.0;
    trafficImpact = 'CRITICAL';
  } else if (severity === 'HIGH') {
    radiusKm = 2.2;
    trafficImpact = 'HIGH';
  }

  const affectedRoadIds = roads
    .filter((r) => r.congestionIndex >= 0.40 || r.status === 'CONGESTED' || r.status === 'EMERGENCY_CORRIDOR')
    .map((r) => r.id);

  return {
    incidentId,
    radiusKm,
    trafficImpact,
    affectedRoadIds: affectedRoadIds.length > 0 ? affectedRoadIds : ['ROAD-01', 'ROAD-02'],
  };
}
