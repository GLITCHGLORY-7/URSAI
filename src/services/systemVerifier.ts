import { UrsaiState } from '../types/ursai';
import { verifyRouteCoordinates } from './routeVerifier';

export type CheckStatus = 'PASS' | 'WARN' | 'FAIL';

export interface VerificationCheck {
  name: string;
  status: CheckStatus;
  message: string;
}

export interface SystemVerificationReport {
  status: 'HEALTHY' | 'DEGRADED' | 'ERROR';
  checks: VerificationCheck[];
  timestamp: string;
}

export function verifyGlobalSystemState(state: UrsaiState): SystemVerificationReport {
  const checks: VerificationCheck[] = [];

  // 1. Simulation Generation Check
  if (typeof state.simulationGeneration === 'number' && state.simulationGeneration >= 0) {
    checks.push({ name: 'Simulation Generation', status: 'PASS', message: `Active Generation ID: #${state.simulationGeneration}` });
  } else {
    checks.push({ name: 'Simulation Generation', status: 'FAIL', message: 'Invalid or missing simulation generation counter.' });
  }

  // 2. Incident Lifecycle Invariant Check
  if (state.activeIncident) {
    const inc = state.activeIncident;
    if (!inc.id || !inc.status) {
      checks.push({ name: 'Incident Integrity', status: 'FAIL', message: 'Active incident object lacks required ID or status.' });
    } else if (inc.status === 'RESOLVED') {
      checks.push({ name: 'Incident Status', status: 'PASS', message: `Incident ${inc.id} is RESOLVED.` });
    } else {
      checks.push({ name: 'Incident Status', status: 'PASS', message: `Incident ${inc.id} active in state ${inc.status}.` });
    }
  } else {
    checks.push({ name: 'Incident Lifecycle', status: 'PASS', message: 'No active incident in system (Standby Mode).' });
  }

  // 3. Ambulance State Machine Invariants
  const amb = state.ambulance;
  if (amb) {
    if (['EN_ROUTE', 'TRANSPORTING', 'ARRIVED_AT_HOSPITAL'].includes(amb.status)) {
      if (!amb.route || amb.route.length === 0) {
        checks.push({
          name: 'Ambulance Route Invariant',
          status: 'FAIL',
          message: `Ambulance status is ${amb.status} but active route geometry is missing.`,
        });
      } else {
        const routeVal = verifyRouteCoordinates(amb.route);
        if (!routeVal.valid) {
          checks.push({
            name: 'Ambulance Route Invariant',
            status: 'FAIL',
            message: `Ambulance active route validation failed: ${routeVal.error}`,
          });
        } else {
          checks.push({ name: 'Ambulance Route Invariant', status: 'PASS', message: `Ambulance active route valid (${amb.route.length} waypoints).` });
        }
      }
    } else {
      checks.push({ name: 'Ambulance State Machine', status: 'PASS', message: `Ambulance in status: ${amb.status}.` });
    }
  } else {
    checks.push({ name: 'Ambulance Agent', status: 'FAIL', message: 'Ambulance state missing.' });
  }

  // 4. Police Agent Invariant
  const pol = state.police;
  if (pol) {
    checks.push({ name: 'Police Agent', status: 'PASS', message: `Police agent status: ${pol.status}.` });
  } else {
    checks.push({ name: 'Police Agent', status: 'FAIL', message: 'Police state missing.' });
  }

  // 5. Traffic Agent & Green Corridor Invariants
  const traf = state.traffic;
  if (traf) {
    if (traf.greenCorridorActive && traf.status !== 'GREEN_CORRIDOR_ACTIVE' && traf.status !== 'RESPONDING') {
      checks.push({
        name: 'Traffic Green Corridor Invariant',
        status: 'WARN',
        message: 'Green corridor is flag-active but status is not GREEN_CORRIDOR_ACTIVE.',
      });
    } else {
      checks.push({ name: 'Traffic Agent', status: 'PASS', message: `Traffic status: ${traf.status} (Green Corridor: ${traf.greenCorridorActive ? 'ON' : 'OFF'}).` });
    }
  } else {
    checks.push({ name: 'Traffic Agent', status: 'FAIL', message: 'Traffic state missing.' });
  }

  // 6. Hospital Invariant Check
  const hosp = state.hospital;
  if (hosp) {
    if (amb.leg === 'HOSPITAL' && amb.status === 'TRANSPORTING') {
      if (!hosp.selectedHospital) {
        checks.push({
          name: 'Hospital Transport Invariant',
          status: 'FAIL',
          message: 'Ambulance transporting patient to hospital but no hospital selected in state.',
        });
      } else {
        checks.push({ name: 'Hospital Selection', status: 'PASS', message: `Assigned hospital: ${hosp.selectedHospital.name}.` });
      }
    } else {
      checks.push({ name: 'Hospital Agent', status: 'PASS', message: `Hospital agent status: ${hosp.status}.` });
    }
  }

  // 7. City Data Simulation Invariants
  const city = state.cityState;
  if (city) {
    if (city.traffic.congestionIndex < 0 || city.traffic.congestionIndex > 1) {
      checks.push({ name: 'City Traffic Index', status: 'FAIL', message: `Traffic congestion index out of bounds [0, 1]: ${city.traffic.congestionIndex}` });
    } else {
      checks.push({ name: 'City Data Engine', status: 'PASS', message: `Traffic congestion index valid (${(city.traffic.congestionIndex * 100).toFixed(0)}%).` });
    }

    if (city.resources.ambulancesAvailable < 0 || city.resources.policeUnitsAvailable < 0) {
      checks.push({ name: 'Resource Availability', status: 'FAIL', message: 'Resource availability count cannot be negative.' });
    } else {
      checks.push({ name: 'Resource Availability', status: 'PASS', message: `Resources: ${city.resources.ambulancesAvailable} Amb, ${city.resources.policeUnitsAvailable} Pol.` });
    }
  } else {
    checks.push({ name: 'City Data Engine', status: 'WARN', message: 'City state not initialized.' });
  }

  // 8. Mission & Adaptive Plan Invariants
  if (state.mission) {
    if (state.mission.planVersion < 1) {
      checks.push({ name: 'Mission Plan Invariant', status: 'FAIL', message: 'Plan version must be >= 1.' });
    } else {
      checks.push({ name: 'Mission State', status: 'PASS', message: `Active Mission ${state.mission.id} (Plan v${state.mission.planVersion}).` });
    }
  } else {
    checks.push({ name: 'Mission State', status: 'PASS', message: 'No active mission currently registered.' });
  }

  // Evaluate overall report status
  const hasFail = checks.some((c) => c.status === 'FAIL');
  const hasWarn = checks.some((c) => c.status === 'WARN');

  const status: SystemVerificationReport['status'] = hasFail ? 'ERROR' : hasWarn ? 'DEGRADED' : 'HEALTHY';

  return {
    status,
    checks,
    timestamp: new Date().toISOString(),
  };
}
