import { IncidentType, Severity } from '../types/ursai';

export interface DemoScenarioConfig {
  id: string;
  name: string;
  type: IncidentType;
  severity: Severity;
  latitude: number;
  longitude: number;
  description: string;
}

export const DEMO_SCENARIOS: Record<'STANDARD' | 'HIGH_PRIORITY', DemoScenarioConfig> = {
  STANDARD: {
    id: 'DEMO-STD-01',
    name: 'STANDARD ACCIDENT',
    type: 'ROAD ACCIDENT',
    severity: 'HIGH',
    latitude: 13.0604,
    longitude: 80.2496,
    description: 'Multi-vehicle collision on Anna Salai flyover corridor requiring urgent dispatch.',
  },
  HIGH_PRIORITY: {
    id: 'DEMO-HP-01',
    name: 'HIGH PRIORITY ACCIDENT',
    type: 'ROAD ACCIDENT',
    severity: 'CRITICAL',
    latitude: 13.0827,
    longitude: 80.2707,
    description: 'Critical multi-car incident at Chennai Central junction requiring full swarm preemption and hospital pre-alert.',
  },
};
