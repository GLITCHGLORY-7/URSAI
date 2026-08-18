import { fetchRoute } from '../services/routingService';
import { RouteResult } from '../types/ursai';

export interface AgentAnimationController {
  cancel: () => void;
}

/**
 * Executes Police dispatch, route fetching, and smooth route movement animation.
 */
export async function runPoliceAgent({
  incidentId,
  destLat,
  destLng,
  depotLat,
  depotLng,
  simulationGeneration,
  dispatch,
  getState,
}: {
  incidentId: string;
  destLat: number;
  destLng: number;
  depotLat: number;
  depotLng: number;
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

  // Step 1: Dispatch Police initial state
  dispatch({
    type: 'DISPATCH_POLICE',
    payload: { incidentId, destLat, destLng },
  });

  // Step 2: Fetch OSRM route for Police
  let routeResult: RouteResult;
  try {
    routeResult = await fetchRoute(depotLat, depotLng, destLat, destLng, abortController.signal);
  } catch (error) {
    if (isCancelled || getState().simulationGeneration !== simulationGeneration) {
      return { cancel };
    }
    dispatch({
      type: 'SET_POLICE_STATUS',
      payload: { status: 'ERROR', task: 'ROUTING FAILURE' },
    });
    return { cancel };
  }

  // Check if simulation was reset during async fetch
  if (isCancelled || getState().simulationGeneration !== simulationGeneration) {
    return { cancel };
  }

  if (routeResult.source === 'FALLBACK') {
    dispatch({
      type: 'ADD_SYSTEM_LOG',
      payload: {
        message: 'POLICE ROUTING DEGRADED: Using direct path fallback.',
        type: 'warning',
        source: 'POLICE',
      },
    });
  }

  // Step 3: Set police route state
  dispatch({
    type: 'SET_POLICE_ROUTE',
    payload: {
      route: routeResult.coordinates,
      distanceMeters: routeResult.distanceMeters,
      durationSeconds: routeResult.durationSeconds,
    },
  });

  // Step 4: Animate movement along route coordinates
  const coords = routeResult.coordinates;
  if (coords.length < 2) {
    dispatch({
      type: 'SET_POLICE_STATUS',
      payload: { status: 'ON_SCENE', task: 'ON SCENE', arrivedAt: new Date().toISOString() },
    });
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
      type: 'UPDATE_POLICE_POSITION',
      payload: {
        lat: currentLat,
        lng: currentLng,
        eta: remainingSeconds,
      },
    });

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      // Reached destination!
      dispatch({
        type: 'SET_POLICE_STATUS',
        payload: {
          status: 'ON_SCENE',
          task: 'ON SCENE (PERIMETER SECURED)',
          arrivedAt: new Date().toISOString(),
        },
      });
    }
  };

  animationFrameId = requestAnimationFrame(animate);

  return { cancel };
}
