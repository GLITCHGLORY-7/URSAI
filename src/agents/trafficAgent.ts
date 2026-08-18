import { fetchRoute } from '../services/routingService';
import { RouteResult } from '../types/ursai';
import { TRAFFIC_DEPOT } from '../data/depots';

export interface AgentAnimationController {
  cancel: () => void;
}

/**
 * Executes Traffic Agent activation, rapid corridor clearance route, and SCATS signal overriding.
 */
export async function runTrafficAgent({
  incidentId,
  destLat,
  destLng,
  ambulanceRoute,
  simulationGeneration,
  dispatch,
  getState,
}: {
  incidentId: string;
  destLat: number;
  destLng: number;
  ambulanceRoute?: [number, number][];
  simulationGeneration: number;
  dispatch: (action: any) => void;
  getState: () => { simulationGeneration: number; demoState?: string; demoSpeed?: string };
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

  // Step 1: Dispatch Traffic Pilot Unit
  dispatch({
    type: 'DISPATCH_TRAFFIC',
    payload: { incidentId, destLat, destLng },
  });

  // Step 2: Fetch OSRM Route from Traffic Depot to Incident (or follow emergency corridor)
  let routeResult: RouteResult;
  try {
    if (ambulanceRoute && ambulanceRoute.length > 2) {
      // Clear ahead of ambulance along the primary transit corridor
      routeResult = {
        coordinates: ambulanceRoute,
        distanceMeters: 4800,
        durationSeconds: 240,
        source: 'OSRM',
      };
    } else {
      routeResult = await fetchRoute(
        TRAFFIC_DEPOT.latitude,
        TRAFFIC_DEPOT.longitude,
        destLat,
        destLng,
        abortController.signal
      );
    }
  } catch (error) {
    if (isCancelled || getState().simulationGeneration !== simulationGeneration) {
      return { cancel };
    }
    routeResult = {
      coordinates: [
        [TRAFFIC_DEPOT.latitude, TRAFFIC_DEPOT.longitude],
        [(TRAFFIC_DEPOT.latitude + destLat) / 2, (TRAFFIC_DEPOT.longitude + destLng) / 2],
        [destLat, destLng],
      ],
      distanceMeters: 3600,
      durationSeconds: 180,
      source: 'FALLBACK',
    };
  }

  if (isCancelled || getState().simulationGeneration !== simulationGeneration) {
    return { cancel };
  }

  // Step 3: Set Traffic Route in State
  dispatch({
    type: 'SET_TRAFFIC_ROUTE',
    payload: {
      route: routeResult.coordinates,
      distanceMeters: routeResult.distanceMeters,
      durationSeconds: routeResult.durationSeconds,
    },
  });

  // Activate Green Wave corridor
  dispatch({
    type: 'ACTIVATE_GREEN_CORRIDOR',
    payload: { route: routeResult.coordinates },
  });

  const coords = routeResult.coordinates;
  if (coords.length < 2) {
    dispatch({
      type: 'SET_TRAFFIC_STATUS',
      payload: {
        status: 'GREEN_CORRIDOR_ACTIVE',
        greenCorridorActive: true,
        task: 'HOLDING GREEN WAVE AT SCENE',
        signalsOverride: 12,
      },
    });
    return { cancel };
  }

  // Calculate segment cumulative distances
  const segmentDistances: number[] = [];
  let totalDist = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const dLat = coords[i + 1][0] - coords[i][0];
    const dLng = coords[i + 1][1] - coords[i][1];
    const dist = Math.hypot(dLat, dLng);
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

    const currentState = getState();
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
    const activeSignals = Math.min(14, 2 + Math.floor(progress * 12));

    dispatch({
      type: 'UPDATE_TRAFFIC_POSITION',
      payload: {
        lat: currentLat,
        lng: currentLng,
        eta: remainingSeconds,
        speedKmh: progress < 1 ? Math.round(55 + Math.sin(progress * 10) * 10) : 0,
        signalsOverride: activeSignals,
      },
    });

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      // Arrived at Scene / secured full corridor
      dispatch({
        type: 'SET_TRAFFIC_STATUS',
        payload: {
          status: 'GREEN_CORRIDOR_ACTIVE',
          greenCorridorActive: true,
          task: 'CORRIDOR SECURED - SCATS SIGNALS HELD IN GREEN WAVE',
          signalsOverride: 14,
        },
      });
    }
  };

  animationFrameId = requestAnimationFrame(animate);

  return { cancel };
}
