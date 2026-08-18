import { Scenario, ScenarioType, ScenarioParameters } from '../../types/ursai';

export class ScenarioEngine {
  public createScenario(
    type: ScenarioType,
    params: ScenarioParameters = {},
    baseMissionId: string | null = null
  ): Scenario {
    const id = `SCN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = new Date().toISOString();

    switch (type) {
      case 'TRAFFIC_INCREASE':
        return {
          id,
          name: 'Traffic Congestion Spike',
          type,
          description: `Simulate a ${params.trafficIncreasePercent || 30}% increase in traffic congestion along the primary dispatch route.`,
          params: { trafficIncreasePercent: params.trafficIncreasePercent || 30 },
          createdAt,
          baseMissionId,
          status: 'DRAFT',
        };

      case 'ROAD_BLOCKAGE':
        return {
          id,
          name: 'Road Blockage Incident',
          type: 'ROAD_BLOCKAGE',
          description: `Simulate a complete road blockage on ${params.blockedRoadName || 'Anna Salai Main Corridor'}, forcing route re-evaluation.`,
          params: { blockedRoadName: params.blockedRoadName || 'Anna Salai Main Corridor' },
          createdAt,
          baseMissionId,
          status: 'DRAFT',
        };

      case 'HOSPITAL_CAPACITY_REDUCTION':
        return {
          id,
          name: 'Hospital Capacity Drop',
          type,
          description: `Simulate a ${params.hospitalCapacityReductionPercent || 50}% drop in ICU and emergency bed availability at the primary destination hospital.`,
          params: { hospitalCapacityReductionPercent: params.hospitalCapacityReductionPercent || 50 },
          createdAt,
          baseMissionId,
          status: 'DRAFT',
        };

      case 'WEATHER_DETERIORATION':
        return {
          id,
          name: 'Weather Deterioration',
          type,
          description: `Simulate sudden severe rainfall (${params.rainSeverity || 'HEAVY'}) and reduced road visibility in Chennai.`,
          params: { rainSeverity: params.rainSeverity || 'HEAVY' },
          createdAt,
          baseMissionId,
          status: 'DRAFT',
        };

      case 'AMBULANCE_DELAY':
        return {
          id,
          name: 'Ambulance Unit Delay',
          type,
          description: `Simulate an unexpected ${params.ambulanceDelayMinutes || 5}-minute dispatch or en-route mechanical delay.`,
          params: { ambulanceDelayMinutes: params.ambulanceDelayMinutes || 5 },
          createdAt,
          baseMissionId,
          status: 'DRAFT',
        };

      case 'GREEN_CORRIDOR_UNAVAILABLE':
        return {
          id,
          name: 'Green Corridor Unavailable',
          type,
          description: 'Simulate emergency response with Green Corridor traffic signal preemption turned OFF.',
          params: { greenCorridorEnabled: false },
          createdAt,
          baseMissionId,
          status: 'DRAFT',
        };

      default:
        throw new Error(`Unsupported scenario type: ${type}`);
    }
  }
}

export const scenarioEngine = new ScenarioEngine();
