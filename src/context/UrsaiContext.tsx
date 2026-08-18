import React, {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import {
  UrsaiState,
  IncidentType,
  Severity,
  Incident,
} from '../types/ursai';
import {
  ursaiReducer,
  initialUrsaiState,
  UrsaiAction,
} from './ursaiReducer';
import { createIncident } from '../incidents/incidentManager';
import { ValidationResult } from '../incidents/incidentValidation';
import { coordinateIncidentResponse, CoordinatorControllers } from '../coordination/coordinator';
import { CHENNAI_INCIDENT_HOTSPOTS } from '../data/incidentLocations';

interface UrsaiContextValue {
  state: UrsaiState;
  dispatch: React.Dispatch<UrsaiAction>;
  submitIncident: (input: {
    type: IncidentType;
    severity: Severity;
    latitude: number;
    longitude: number;
    description: string;
  }) => { success: boolean; incident?: Incident; validation?: ValidationResult };
  simulateAccident: (hotspotIndex?: number) => { success: boolean; incident?: Incident };
  resetSystem: () => void;
  setMapSelectionMode: (active: boolean) => void;
  setSelectedLocation: (coords: { lat: number; lng: number } | null) => void;
  setActiveTab: (tab: 'COMMAND_CENTER' | 'SCENARIO_LAB' | 'SWARM_LAB' | 'STRESS_LAB' | 'PERFORMANCE' | 'ABOUT') => void;
  togglePresentationMode: () => void;
  startDemo: () => void;
  pauseDemo: () => void;
  resumeDemo: () => void;
  setDemoSpeed: (speed: 'NORMAL' | 'DEMO_SPEED') => void;
  setDemoScenario: (scenario: 'STANDARD' | 'HIGH_PRIORITY') => void;
}

const UrsaiContext = createContext<UrsaiContextValue | undefined>(undefined);

export const UrsaiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(ursaiReducer, initialUrsaiState);

  const activeControllersRef = useRef<CoordinatorControllers | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const hotspotIndexRef = useRef<number>(0);

  const resetSystem = useCallback(() => {
    // 1. Cancel all active agent animations and async fetches instantly
    if (activeControllersRef.current) {
      activeControllersRef.current.cancelAll();
      activeControllersRef.current = null;
    }

    // 2. Dispatch reset to central reducer
    dispatch({ type: 'RESET_SYSTEM' });
  }, []);

  const setMapSelectionMode = useCallback((active: boolean) => {
    dispatch({ type: 'SET_MAP_SELECTION_MODE', payload: active });
  }, []);

  const setSelectedLocation = useCallback((coords: { lat: number; lng: number } | null) => {
    dispatch({ type: 'SET_SELECTED_LOCATION', payload: coords });
  }, []);

  const submitIncident = useCallback(
    (input: {
      type: IncidentType;
      severity: Severity;
      latitude: number;
      longitude: number;
      description: string;
    }) => {
      // 1. Cancel previous active controllers if any
      if (activeControllersRef.current) {
        activeControllersRef.current.cancelAll();
        activeControllersRef.current = null;
      }

      // 2. Validate and create incident object
      const { incident, validation } = createIncident(input);

      if (!validation.isValid || !incident) {
        return { success: false, validation };
      }

      // 3. Dispatch Incident Creation to Central State (increments simulationGeneration in reducer)
      const nextGen = stateRef.current.simulationGeneration + 1;
      dispatch({ type: 'CREATE_INCIDENT', payload: incident });

      const getStateHelper = () => stateRef.current;

      // 4. Coordinate Multi-Agent Incident Response
      coordinateIncidentResponse({
        incident,
        hospitals: stateRef.current.hospital.allHospitals,
        simulationGeneration: nextGen,
        dispatch,
        getState: getStateHelper,
      }).then((controllers) => {
        activeControllersRef.current = controllers;
      });

      return { success: true, incident, validation };
    },
    []
  );

  const simulateAccident = useCallback((hotspotIndex?: number) => {
    // 1. Cancel previous controllers
    if (activeControllersRef.current) {
      activeControllersRef.current.cancelAll();
      activeControllersRef.current = null;
    }

    // 2. Select hotspot: either user-specified index or cycle through Chennai hotspots
    const totalHotspots = CHENNAI_INCIDENT_HOTSPOTS.length;
    let chosenIdx: number;
    if (typeof hotspotIndex === 'number' && hotspotIndex >= 0 && hotspotIndex < totalHotspots) {
      chosenIdx = hotspotIndex;
      hotspotIndexRef.current = (hotspotIndex + 1) % totalHotspots;
    } else {
      chosenIdx = hotspotIndexRef.current % totalHotspots;
      hotspotIndexRef.current = (hotspotIndexRef.current + 1) % totalHotspots;
    }

    const hotspot = CHENNAI_INCIDENT_HOTSPOTS[chosenIdx];

    const simCoords = {
      latitude: hotspot.latitude,
      longitude: hotspot.longitude,
      type: hotspot.type,
      severity: hotspot.severity,
      description: `${hotspot.name}: ${hotspot.description}`,
    };

    // Ensure we switch to the Command Center tab so the user immediately sees the map & swarm
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'COMMAND_CENTER' });

    return submitIncident(simCoords);
  }, [submitIncident]);

  const setActiveTab = useCallback((tab: 'COMMAND_CENTER' | 'SCENARIO_LAB' | 'SWARM_LAB' | 'STRESS_LAB' | 'PERFORMANCE' | 'ABOUT') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const togglePresentationMode = useCallback(() => {
    dispatch({ type: 'SET_PRESENTATION_MODE', payload: !stateRef.current.isPresentationMode });
  }, []);

  const setDemoSpeed = useCallback((speed: 'NORMAL' | 'DEMO_SPEED') => {
    dispatch({ type: 'SET_DEMO_SPEED', payload: speed });
  }, []);

  const setDemoScenario = useCallback((scenario: 'STANDARD' | 'HIGH_PRIORITY') => {
    dispatch({ type: 'SET_DEMO_SCENARIO', payload: scenario });
  }, []);

  const startDemo = useCallback(() => {
    // 1. Cancel previous controllers
    if (activeControllersRef.current) {
      activeControllersRef.current.cancelAll();
      activeControllersRef.current = null;
    }

    dispatch({ type: 'SET_DEMO_STATE', payload: 'RUNNING' });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'COMMAND_CENTER' });

    const scen = stateRef.current.demoScenario || 'STANDARD';
    const totalHotspots = CHENNAI_INCIDENT_HOTSPOTS.length;

    let hotspot;
    if (scen === 'HIGH_PRIORITY') {
      hotspot = CHENNAI_INCIDENT_HOTSPOTS[1]; // Chennai Central Junction
    } else {
      // Cycle through different hotspots across Chennai
      const chosenIdx = hotspotIndexRef.current % totalHotspots;
      hotspotIndexRef.current = (hotspotIndexRef.current + 1) % totalHotspots;
      hotspot = CHENNAI_INCIDENT_HOTSPOTS[chosenIdx];
    }

    const coords = {
      latitude: hotspot.latitude,
      longitude: hotspot.longitude,
      type: hotspot.type,
      severity: hotspot.severity,
      description: `${hotspot.name}: ${hotspot.description}`,
    };

    submitIncident(coords);
  }, [submitIncident]);

  const pauseDemo = useCallback(() => {
    dispatch({ type: 'SET_DEMO_STATE', payload: 'PAUSED' });
    dispatch({
      type: 'ADD_SYSTEM_LOG',
      payload: {
        message: 'DEMO SIMULATION PAUSED: Agent animations and state updates paused.',
        type: 'warning',
        source: 'SYSTEM',
      },
    });
  }, []);

  const resumeDemo = useCallback(() => {
    dispatch({ type: 'SET_DEMO_STATE', payload: 'RUNNING' });
    dispatch({
      type: 'ADD_SYSTEM_LOG',
      payload: {
        message: 'DEMO SIMULATION RESUMED: Continuing response execution.',
        type: 'info',
        source: 'SYSTEM',
      },
    });
  }, []);

  return (
    <UrsaiContext.Provider
      value={{
        state,
        dispatch,
        submitIncident,
        simulateAccident,
        resetSystem,
        setMapSelectionMode,
        setSelectedLocation,
        setActiveTab,
        togglePresentationMode,
        startDemo,
        pauseDemo,
        resumeDemo,
        setDemoSpeed,
        setDemoScenario,
      }}
    >
      {children}
    </UrsaiContext.Provider>
  );
};

export function useUrsai(): UrsaiContextValue {
  const context = useContext(UrsaiContext);
  if (!context) {
    throw new Error('useUrsai must be used within an UrsaiProvider');
  }
  return context;
}
