import { Hospital } from '../data/hospitals';
import { selectBestHospital } from '../services/hospitalService';
import { SIMULATION_TIMING } from '../config/simulation';
import { eventBus } from '../coordination/eventBus';

export interface HospitalAgentController {
  cancel: () => void;
}

export async function runHospitalAgent({
  incidentId,
  incidentLat,
  incidentLng,
  hospitals,
  simulationGeneration,
  dispatch,
  getState,
}: {
  incidentId: string;
  incidentLat: number;
  incidentLng: number;
  hospitals: Hospital[];
  simulationGeneration: number;
  dispatch: (action: any) => void;
  getState: () => { simulationGeneration: number };
}): Promise<{ controller: HospitalAgentController; selectedHospital: Hospital | null }> {
  let isCancelled = false;
  let timerId: NodeJS.Timeout | null = null;

  const cancel = () => {
    isCancelled = true;
    if (timerId !== null) clearTimeout(timerId);
  };

  // 1. Select Hospital
  const selectionResult = selectBestHospital(incidentLat, incidentLng, hospitals);

  if (!selectionResult) {
    dispatch({
      type: 'ADD_SYSTEM_LOG',
      payload: {
        message: 'NO SUITABLE HOSPITAL AVAILABLE: All simulated medical centers at capacity or offline.',
        type: 'danger',
        source: 'HOSPITAL',
      },
    });
    return { controller: { cancel }, selectedHospital: null };
  }

  const { hospital, factors } = selectionResult;

  // 2. Dispatch SELECT_HOSPITAL
  dispatch({
    type: 'SELECT_HOSPITAL',
    payload: {
      hospital,
      factors,
      incidentId,
    },
  });

  eventBus.emit('HOSPITAL_SELECTED', incidentId, 'HOSPITAL_AGENT', {
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    distanceKm: factors.distanceKm,
  });

  // 3. Step: NOTIFIED (after short delay)
  timerId = setTimeout(() => {
    if (isCancelled || getState().simulationGeneration !== simulationGeneration) return;

    dispatch({
      type: 'SET_HOSPITAL_STATUS',
      payload: { status: 'NOTIFIED', timeField: 'notifiedAt' },
    });

    eventBus.emit('HOSPITAL_NOTIFIED', incidentId, 'HOSPITAL_AGENT', { hospitalId: hospital.id });

    // 4. Step: PREPARING
    timerId = setTimeout(() => {
      if (isCancelled || getState().simulationGeneration !== simulationGeneration) return;

      dispatch({
        type: 'SET_HOSPITAL_STATUS',
        payload: { status: 'PREPARING', timeField: 'preparingAt' },
      });

      eventBus.emit('HOSPITAL_PREPARING', incidentId, 'HOSPITAL_AGENT', { hospitalId: hospital.id });

      // 5. Step: READY
      timerId = setTimeout(() => {
        if (isCancelled || getState().simulationGeneration !== simulationGeneration) return;

        dispatch({
          type: 'SET_HOSPITAL_STATUS',
          payload: { status: 'READY', timeField: 'readyAt' },
        });

        eventBus.emit('HOSPITAL_READY', incidentId, 'HOSPITAL_AGENT', { hospitalId: hospital.id });
      }, SIMULATION_TIMING.hospitalPreparationMs);
    }, SIMULATION_TIMING.hospitalNotificationMs);
  }, 500);

  return { controller: { cancel }, selectedHospital: hospital };
}
