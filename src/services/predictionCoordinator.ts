import { UrsaiState } from '../types/ursai';
import { UrsaiAction } from '../context/ursaiReducer';
import { buildSituationSnapshot } from './situationAnalyzer';
import { runPredictiveEngine } from './predictiveEngine';
import { eventBus } from '../coordination/eventBus';

let activePredictionPromise: Promise<void> | null = null;

/**
 * Triggers situation awareness and predictive intelligence analysis
 * at key system milestones.
 * Includes protection against stale requests across simulation resets.
 */
export async function triggerPredictionAnalysis(
  getState: () => UrsaiState,
  dispatch: (action: UrsaiAction) => void,
  reason: string = 'SITUATION_UPDATE'
): Promise<void> {
  const state = getState();

  if (!state.activeIncident || state.activeIncident.status === 'RESOLVED') {
    return;
  }

  const currentGen = state.simulationGeneration;
  const snapshot = buildSituationSnapshot(state);

  dispatch({ type: 'START_PREDICTION_ANALYSIS' });

  eventBus.emit('PREDICTION_ANALYSIS_STARTED', state.activeIncident.id, 'PREDICTIVE_ENGINE', {
    reason,
    simulationGeneration: currentGen,
  });

  try {
    const result = await runPredictiveEngine(snapshot);

    // Stale protection: check if simulation generation has changed during async fetch
    if (getState().simulationGeneration !== currentGen) {
      console.log('[Prediction Coordinator] Ignored stale prediction result from previous simulation generation');
      return;
    }

    dispatch({
      type: 'SET_PREDICTION_RESULT',
      payload: {
        prediction: result.prediction,
        source: result.source,
        simulationGeneration: currentGen,
      },
    });

    eventBus.emit('PREDICTION_RECEIVED', state.activeIncident.id, 'PREDICTIVE_ENGINE', {
      source: result.source,
      prediction: result.prediction,
    });

    if (result.source === 'RULE_BASED_FALLBACK') {
      eventBus.emit('PREDICTION_FALLBACK_USED', state.activeIncident.id, 'PREDICTIVE_ENGINE', {
        reason: 'NVIDIA NIM unavailable or returned fallback',
      });
    }

    eventBus.emit('SITUATION_UPDATED', state.activeIncident.id, 'SITUATION_ANALYZER', {
      snapshot,
      prediction: result.prediction,
    });
  } catch (err: any) {
    if (getState().simulationGeneration !== currentGen) return;

    dispatch({
      type: 'SET_PREDICTION_FAILED',
      payload: err.message || 'Predictive analysis failed',
    });

    eventBus.emit('PREDICTION_FAILED', state.activeIncident.id, 'PREDICTIVE_ENGINE', {
      error: err.message || err,
    });
  }
}
