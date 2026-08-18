import { fetchRoute } from '../services/routingService';
import { RouteResult, Hospital } from '../types/ursai';
import { eventBus } from '../coordination/eventBus';

export interface AgentAnimationController {
  cancel: () => void;
}

/**
 * Executes Ambulance dispatch for Leg 1 (Depot -> Incident)
 */
export async function runAmbulanceAgent({
  incidentId,
  destLat,
  destLng,
  depotLat,
  depotLng,
  simulationGeneration,
  dispatch,
  getState,
  onArrivedAtScene,
}: {
  incidentId: string;
  destLat: number;
  destLng: number;
  depotLat: number;
  depotLng: number;
  simulationGeneration: number;
  dispatch: (action: any) => void;
  getState: () => { simulationGeneration: number };
  onArrivedAtScene?: () => void;
}): Promise<AgentAnimationController> {
  const abortController = new AbortController();
  let animationFrameId: number | null = null;
  let isCancelled = false;

  const cancel = () => {
    isCancelled = true;
    abortController.abort();
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  dispatch({
    type: 'DISPATCH_AMBULANCE',
    payload: { incidentId, destLat, destLng },
  });

  let routeResult: RouteResult;
  try {
    routeResult = await fetchRoute(depotLat, depotLng, destLat, destLng, abortController.signal);
  } catch (error) {
    if (isCancelled || getState().simulationGeneration !== simulationGeneration) {
      return { cancel };
    }
    dispatch({
      type: 'SET_AMBULANCE_STATUS',
      payload: { status: 'ERROR', task: 'ROUTING FAILURE' },
    });
    return { cancel };
  }

  if (isCancelled || getState().simulationGeneration !== simulationGeneration) {
    return { cancel };
  }

  if (routeResult.source === 'FALLBACK') {
    dispatch({
      type: 'SET_SYSTEM_STATUS',
      payload: {
        status: 'SYSTEM_DEGRADED',
        message: 'AMBULANCE ROUTING DEGRADED: OSRM service unreachable. Direct-path fallback engaged.',
      },
    });
  }

  dispatch({
    type: 'SET_AMBULANCE_ROUTE',
    payload: {
      route: routeResult.coordinates,
      distanceMeters: routeResult.distanceMeters,
      durationSeconds: routeResult.durationSeconds,
      leg: 'SCENE',
    },
  });

  const coords = routeResult.coordinates;
  if (coords.length < 2) {
    dispatch({
      type: 'SET_AMBULANCE_STATUS',
      payload: { status: 'AT_SCENE', task: 'ON SCENE (TRIAGE ACTIVE)', arrivedAt: new Date().toISOString() },
    });
    if (onArrivedAtScene) onArrivedAtScene();
    return { cancel };
  }

  // Calculate segment cumulative distances
  const segmentDistances: number[] = [];
  let totalDist = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const dLat = coords[i + 1][0] - coords[i][0];
    const dLng = coords[i + 1][1] - coords[i][1];
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    segmentDistances.push(dist);
    totalDist += dist;
  }

  // Animation duration: 25s to 35s
  const targetSimDurationMs = Math.min(35000, Math.max(25000, routeResult.durationSeconds * 60));
  let lastNow = performance.now();
  let accumulatedActiveTime = 0;

  const animate = (now: number) => {
    if (isCancelled || getState().simulationGeneration !== simulationGeneration) {
      return;
    }

    const delta = now - lastNow;
    lastNow = now;

    const currentState = getState() as any;
    if (currentState.demoState !== 'PAUSED') {
      const speedMult = currentState.demoSpeed === 'DEMO_SPEED' ? 3.0 : 1.0;
      accumulatedActiveTime += delta * speedMult;
    }

    const progress = Math.min(1, accumulatedActiveTime / targetSimDurationMs);

    const targetDist = progress * totalDist;
    let accumulated = 0;
    let currentLat = coords[0][0];
    let currentLng = coords[0][1];

    for (let i = 0; i < segmentDistances.length; i++) {
      const segDist = segmentDistances[i];
      if (accumulated + segDist >= targetDist || i === segmentDistances.length - 1) {
        const segProgress = segDist > 0 ? (targetDist - accumulated) / segDist : 0;
        const clampedSegProg = Math.max(0, Math.min(1, segProgress));
        currentLat = coords[i][0] + (coords[i + 1][0] - coords[i][0]) * clampedSegProg;
        currentLng = coords[i][1] + (coords[i + 1][1] - coords[i][1]) * clampedSegProg;
        break;
      }
      accumulated += segDist;
    }

    const remainingSeconds = Math.round(routeResult.durationSeconds * (1 - progress));

    dispatch({
      type: 'UPDATE_AMBULANCE_POSITION',
      payload: {
        lat: currentLat,
        lng: currentLng,
        eta: remainingSeconds,
      },
    });

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      // Arrived at Scene!
      dispatch({
        type: 'SET_AMBULANCE_STATUS',
        payload: {
          status: 'AT_SCENE',
          task: 'ON SCENE (PATIENT TRIAGE & STABILIZATION)',
          arrivedAt: new Date().toISOString(),
        },
      });
      eventBus.emit('AMBULANCE_AT_SCENE', incidentId, 'AMBULANCE_AGENT');
      if (onArrivedAtScene) onArrivedAtScene();
    }
  };

  animationFrameId = requestAnimationFrame(animate);

  return { cancel };
}

/**
 * Executes Ambulance Leg 2 Transport (Incident Scene -> Selected Hospital)
 */
export async function runAmbulanceHospitalTransport({
  incidentId,
  startLat,
  startLng,
  hospital,
  simulationGeneration,
  dispatch,
  getState,
}: {
  incidentId: string;
  startLat: number;
  startLng: number;
  hospital: Hospital;
  simulationGeneration: number;
  dispatch: (action: any) => void;
  getState: () => { simulationGeneration: number };
}): Promise<AgentAnimationController> {
  const abortController = new AbortController();
  let animationFrameId: number | null = null;
  let isCancelled = false;

  const cancel = () => {
    isCancelled = true;
    abortController.abort();
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  // 1. Fetch Route to Hospital
  let routeResult: RouteResult;
  try {
    routeResult = await fetchRoute(startLat, startLng, hospital.latitude, hospital.longitude, abortController.signal);
  } catch (error) {
    if (isCancelled || getState().simulationGeneration !== simulationGeneration) {
      return { cancel };
    }
    dispatch({
      type: 'SET_AMBULANCE_STATUS',
      payload: { status: 'ERROR', task: 'HOSPITAL ROUTING FAILURE' },
    });
    return { cancel };
  }

  if (isCancelled || getState().simulationGeneration !== simulationGeneration) {
    return { cancel };
  }

  // 2. Set Leg 2 Route State
  dispatch({
    type: 'SET_AMBULANCE_HOSPITAL_ROUTE',
    payload: {
      route: routeResult.coordinates,
      distanceMeters: routeResult.distanceMeters,
      durationSeconds: routeResult.durationSeconds,
      hospital,
    },
  });

  eventBus.emit('AMBULANCE_TRANSPORTING', incidentId, 'AMBULANCE_AGENT', {
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    distanceKm: (routeResult.distanceMeters / 1000).toFixed(1),
  });

  // 3. Animate along Hospital Route
  const coords = routeResult.coordinates;
  if (coords.length < 2) {
    dispatch({
      type: 'SET_AMBULANCE_STATUS',
      payload: { status: 'ARRIVED_AT_HOSPITAL', task: 'AT HOSPITAL (PATIENT HANDOFF)' },
    });
    dispatch({ type: 'SET_HOSPITAL_PATIENT_RECEIVED' });
    dispatch({ type: 'UPDATE_INCIDENT_STATUS', payload: 'RESOLVED' });
    return { cancel };
  }

  const segmentDistances: number[] = [];
  let totalDist = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const dLat = coords[i + 1][0] - coords[i][0];
    const dLng = coords[i + 1][1] - coords[i][1];
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    segmentDistances.push(dist);
    totalDist += dist;
  }

  // Animation duration: 25s to 35s
  const targetSimDurationMs = Math.min(35000, Math.max(25000, routeResult.durationSeconds * 60));
  let lastNow = performance.now();
  let accumulatedActiveTime = 0;

  const animate = (now: number) => {
    if (isCancelled || getState().simulationGeneration !== simulationGeneration) {
      return;
    }

    const delta = now - lastNow;
    lastNow = now;

    const currentState = getState() as any;
    if (currentState.demoState !== 'PAUSED') {
      const speedMult = currentState.demoSpeed === 'DEMO_SPEED' ? 3.0 : 1.0;
      accumulatedActiveTime += delta * speedMult;
    }

    const progress = Math.min(1, accumulatedActiveTime / targetSimDurationMs);

    const targetDist = progress * totalDist;
    let accumulated = 0;
    let currentLat = coords[0][0];
    let currentLng = coords[0][1];

    for (let i = 0; i < segmentDistances.length; i++) {
      const segDist = segmentDistances[i];
      if (accumulated + segDist >= targetDist || i === segmentDistances.length - 1) {
        const segProgress = segDist > 0 ? (targetDist - accumulated) / segDist : 0;
        const clampedSegProg = Math.max(0, Math.min(1, segProgress));
        currentLat = coords[i][0] + (coords[i + 1][0] - coords[i][0]) * clampedSegProg;
        currentLng = coords[i][1] + (coords[i + 1][1] - coords[i][1]) * clampedSegProg;
        break;
      }
      accumulated += segDist;
    }

    const remainingSeconds = Math.round(routeResult.durationSeconds * (1 - progress));

    dispatch({
      type: 'UPDATE_AMBULANCE_POSITION',
      payload: {
        lat: currentLat,
        lng: currentLng,
        eta: remainingSeconds,
      },
    });

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      // Arrived at Hospital!
      dispatch({
        type: 'SET_AMBULANCE_STATUS',
        payload: {
          status: 'ARRIVED_AT_HOSPITAL',
          task: 'AT HOSPITAL (PATIENT HANDOFF COMPLETE)',
          arrivedAt: new Date().toISOString(),
        },
      });

      dispatch({ type: 'SET_HOSPITAL_PATIENT_RECEIVED' });
      dispatch({ type: 'DEACTIVATE_GREEN_CORRIDOR' });
      dispatch({ type: 'UPDATE_INCIDENT_STATUS', payload: 'RESOLVED' });

      eventBus.emit('AMBULANCE_AT_HOSPITAL', incidentId, 'AMBULANCE_AGENT', { hospitalName: hospital.name });
      eventBus.emit('PATIENT_RECEIVED', incidentId, 'HOSPITAL_AGENT', { hospitalName: hospital.name });
      eventBus.emit('INCIDENT_RESOLVED', incidentId, 'COORDINATOR');
    }
  };

  animationFrameId = requestAnimationFrame(animate);

  return { cancel };
}
