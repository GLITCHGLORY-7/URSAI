import { UrsaiState, Hospital } from '../../types/ursai';

export interface DigitalTwinState extends UrsaiState {
  isSimulatedCopy: true;
}

/**
 * Creates a deep, immutable clone of the current normalized URSAI state
 * to be used exclusively within the Digital Twin Scenario Sandbox.
 */
export function createDigitalTwinState(liveState: UrsaiState): DigitalTwinState {
  // Deep clone to guarantee absolute isolation from live application state
  const clonedState = JSON.parse(JSON.stringify(liveState)) as UrsaiState;

  return {
    ...clonedState,
    isSimulatedCopy: true,
  };
}
