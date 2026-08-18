import { UrsaiState } from '../types/ursai';

export interface SituationSnapshot {
  simulationGeneration: number;
  timestamp: string;
  incident: {
    id: string;
    type: string;
    severity: string;
    latitude: number;
    longitude: number;
    description: string;
    status: string;
    ageSeconds: number;
  } | null;
  city: {
    trafficLevel: string;
    congestionIndex: number;
    averageSpeedKmh: number;
    weatherCondition: string;
    temperatureC: number;
    visibilityKm: number;
    affectedRoadsCount: number;
    ambulancesAvailable: number;
    policeUnitsAvailable: number;
    hospitalPressure: string;
  };
  mission?: {
    planVersion: number;
    planStatus: string;
    replanningCount: number;
  } | null;
  agents: {
    ambulance: {
      status: string;
      task: string;
      etaSeconds: number | null;
      leg: 'SCENE' | 'HOSPITAL';
      routeDistanceMeters: number | null;
      routeDurationSeconds: number | null;
    };
    police: {
      status: string;
      task: string | null;
      etaSeconds: number | null;
    };
    hospital: {
      selectedName: string | null;
      bedsAvailable: number | null;
      icuBedsAvailable: number | null;
      emergencyReady: boolean | null;
      status: string;
      distanceKm: number | null;
    };
  };
  traffic: {
    status: string;
    greenCorridorActive: boolean;
  };
  aiDecision: {
    engine: string;
    severity: string;
    priority: string;
    greenCorridor: boolean;
    hospitalRequired: boolean;
  } | null;
  systemStatus: string;
}

/**
 * Builds a single consistent snapshot of current city, mission, and agent state
 * to feed into the situation awareness and predictive intelligence layer.
 */
export function buildSituationSnapshot(state: UrsaiState): SituationSnapshot {
  const incidentAgeSeconds = state.activeIncident?.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(state.activeIncident.createdAt).getTime()) / 1000))
    : 0;

  return {
    simulationGeneration: state.simulationGeneration,
    timestamp: new Date().toISOString(),
    incident: state.activeIncident
      ? {
          id: state.activeIncident.id,
          type: state.activeIncident.type,
          severity: state.activeIncident.severity,
          latitude: state.activeIncident.latitude,
          longitude: state.activeIncident.longitude,
          description: state.activeIncident.description,
          status: state.activeIncident.status,
          ageSeconds: incidentAgeSeconds,
        }
      : null,
    city: {
      trafficLevel: state.cityState?.traffic?.overallLevel || 'LOW',
      congestionIndex: state.cityState?.traffic?.congestionIndex || 0.25,
      averageSpeedKmh: state.cityState?.traffic?.averageSpeedKmh || 45,
      weatherCondition: state.cityState?.weather?.condition || 'CLEAR',
      temperatureC: state.cityState?.weather?.temperatureC || 31,
      visibilityKm: state.cityState?.weather?.visibilityKm || 8,
      affectedRoadsCount: state.cityState?.affectedRoadsCount || 0,
      ambulancesAvailable: state.cityState?.resources?.ambulancesAvailable ?? 5,
      policeUnitsAvailable: state.cityState?.resources?.policeUnitsAvailable ?? 5,
      hospitalPressure: state.cityState?.hospitalPressure || 'LOW',
    },
    mission: state.mission
      ? {
          planVersion: state.mission.planVersion,
          planStatus: state.mission.planStatus,
          replanningCount: state.mission.replanningCount,
        }
      : null,
    agents: {
      ambulance: {
        status: state.ambulance.status,
        task: String(state.ambulance.currentTask),
        etaSeconds: state.ambulance.eta,
        leg: state.ambulance.leg,
        routeDistanceMeters: state.ambulance.routeDistance,
        routeDurationSeconds: state.ambulance.routeDuration,
      },
      police: {
        status: state.police.status,
        task: state.police.currentTask,
        etaSeconds: state.police.eta,
      },
      hospital: {
        selectedName: state.hospital.selectedHospital?.name || null,
        bedsAvailable: state.hospital.selectedHospital?.bedsAvailable ?? null,
        icuBedsAvailable: state.hospital.selectedHospital?.icuBedsAvailable ?? null,
        emergencyReady: state.hospital.selectedHospital?.emergencyReady ?? null,
        status: state.hospital.status,
        distanceKm: state.hospital.selectionFactors?.distanceKm ?? null,
      },
    },
    traffic: {
      status: state.traffic.status,
      greenCorridorActive: state.traffic.greenCorridorActive,
    },
    aiDecision: state.aiDecision
      ? {
          engine: state.aiDecision.engine,
          severity: state.aiDecision.severity,
          priority: state.aiDecision.priority,
          greenCorridor: state.aiDecision.greenCorridor,
          hospitalRequired: state.aiDecision.hospitalRequired,
        }
      : null,
    systemStatus: state.systemStatus,
  };
}
