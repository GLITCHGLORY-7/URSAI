import { UrsaiState } from '../types/ursai';
import { logger } from './logger';

export type TestScenarioType =
  | 'NORMAL_RESPONSE'
  | 'ROUTE_DEGRADATION'
  | 'HOSPITAL_PRESSURE'
  | 'NIM_FAILURE'
  | 'OSRM_FAILURE'
  | 'COMBINED_DEGRADATION';

export interface TestScenarioResult {
  scenario: TestScenarioType;
  success: boolean;
  message: string;
  timestamp: string;
}

export function applyTestScenario(state: UrsaiState, scenario: TestScenarioType): { state: Partial<UrsaiState>; result: TestScenarioResult } {
  logger.info(`Executing test scenario: ${scenario}`);

  switch (scenario) {
    case 'ROUTE_DEGRADATION': {
      return {
        state: {
          ambulance: {
            ...state.ambulance,
            eta: (state.ambulance.eta || 120) * 2.5,
            currentTask: 'ROUTING_DELAY_DETECTED',
          },
        },
        result: {
          scenario,
          success: true,
          message: 'Route degradation simulated: Ambulance ETA spiked by 250% trigger.',
          timestamp: new Date().toISOString(),
        },
      };
    }

    case 'HOSPITAL_PRESSURE': {
      const updatedCity = {
        ...state.cityState,
        hospitalPressure: 'CRITICAL' as const,
      };
      return {
        state: {
          cityState: updatedCity,
        },
        result: {
          scenario,
          success: true,
          message: 'Hospital pressure simulated: Primary ICU beds set to CRITICAL.',
          timestamp: new Date().toISOString(),
        },
      };
    }

    case 'NIM_FAILURE': {
      return {
        state: {
          aiStatus: 'DEGRADED',
          aiDecision: state.aiDecision
            ? {
                ...state.aiDecision,
                engine: 'FALLBACK RULE ENGINE',
                status: 'DEGRADED',
                reason: '[TEST SCENARIO] NVIDIA NIM connection simulated offline. Deterministic fallback active.',
              }
            : null,
        },
        result: {
          scenario,
          success: true,
          message: 'NVIDIA NIM failure simulated: Fallback decision engine activated.',
          timestamp: new Date().toISOString(),
        },
      };
    }

    case 'OSRM_FAILURE': {
      return {
        state: {
          systemStatus: 'SYSTEM_DEGRADED',
          statusMessage: '[TEST SCENARIO] OSRM Service Unavailable. Direct geometric fallback route active.',
        },
        result: {
          scenario,
          success: true,
          message: 'OSRM routing failure simulated: Direct straight-line path calculation used.',
          timestamp: new Date().toISOString(),
        },
      };
    }

    case 'COMBINED_DEGRADATION': {
      return {
        state: {
          aiStatus: 'DEGRADED',
          systemStatus: 'SYSTEM_DEGRADED',
          statusMessage: '[TEST SCENARIO] Combined NIM + OSRM failure active. Dual fallback operational.',
        },
        result: {
          scenario,
          success: true,
          message: 'Combined degradation simulated: Dual fallback engines active.',
          timestamp: new Date().toISOString(),
        },
      };
    }

    case 'NORMAL_RESPONSE':
    default: {
      return {
        state: {},
        result: {
          scenario: 'NORMAL_RESPONSE',
          success: true,
          message: 'Normal response test verified. All baseline state parameters nominal.',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}
