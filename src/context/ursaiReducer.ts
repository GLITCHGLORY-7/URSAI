import {
  UrsaiState,
  Incident,
  IncidentStatus,
  AmbulanceStatus,
  PoliceStatus,
  TrafficStatus,
  Traffic,
  SystemStatusType,
  SystemLog,
  HospitalState,
  HospitalAgentStatus,
  HospitalSelectionFactors,
  AIDecision,
  AIDecisionStatus,
  PredictionState,
  PredictionData,
  PredictionSource,
  CityState,
  Mission,
  ResponsePlan,
  MissionStatus,
  PlanStatus,
  MissionOptimization,
} from '../types/ursai';
import { Hospital, INITIAL_HOSPITALS } from '../data/hospitals';
import { AMBULANCE_DEPOT, POLICE_DEPOT, TRAFFIC_DEPOT } from '../data/depots';
import { INITIAL_CITY_STATE } from '../services/cityDataEngine';

export type UrsaiAction =
  | { type: 'SET_MAP_SELECTION_MODE'; payload: boolean }
  | { type: 'SET_SELECTED_LOCATION'; payload: { lat: number; lng: number } | null }
  | { type: 'CREATE_INCIDENT'; payload: Incident }
  | { type: 'UPDATE_INCIDENT_STATUS'; payload: IncidentStatus }
  | { type: 'SET_AI_ANALYSIS_STARTED' }
  | { type: 'SET_AI_DECISION'; payload: AIDecision }
  | { type: 'START_PREDICTION_ANALYSIS' }
  | {
      type: 'SET_PREDICTION_RESULT';
      payload: {
        prediction: PredictionData;
        source: PredictionSource;
        simulationGeneration: number;
      };
    }
  | { type: 'SET_PREDICTION_FAILED'; payload: string }
  | { type: 'CLEAR_PREDICTION' }
  | { type: 'SET_DATA_SOURCE_MODE'; payload: 'HYBRID' | 'REAL' | 'SIMULATED' | 'FALLBACK' }
  | { type: 'UPDATE_CITY_STATE'; payload: CityState }
  | { type: 'SET_MISSION_PLAN'; payload: { mission: Mission; plan: ResponsePlan; optimization?: MissionOptimization } }
  | { type: 'UPDATE_MISSION_PLAN'; payload: { plan: ResponsePlan; reason: string; optimization?: MissionOptimization } }
  | { type: 'SET_MISSION_STATUS'; payload: { status: MissionStatus; planStatus?: PlanStatus } }
  | { type: 'UPDATE_OPTIMIZATION'; payload: MissionOptimization }
  | { type: 'DISPATCH_AMBULANCE'; payload: { incidentId: string; destLat: number; destLng: number } }
  | {
      type: 'SET_AMBULANCE_ROUTE';
      payload: {
        route: [number, number][];
        distanceMeters: number;
        durationSeconds: number;
        leg?: 'SCENE' | 'HOSPITAL';
      };
    }
  | {
      type: 'SET_AMBULANCE_HOSPITAL_ROUTE';
      payload: {
        route: [number, number][];
        distanceMeters: number;
        durationSeconds: number;
        hospital: Hospital;
      };
    }
  | { type: 'UPDATE_AMBULANCE_POSITION'; payload: { lat: number; lng: number; eta: number } }
  | { type: 'SET_AMBULANCE_STATUS'; payload: { status: AmbulanceStatus; task?: string; arrivedAt?: string } }
  | { type: 'DISPATCH_POLICE'; payload: { incidentId: string; destLat: number; destLng: number } }
  | {
      type: 'SET_POLICE_ROUTE';
      payload: {
        route: [number, number][];
        distanceMeters: number;
        durationSeconds: number;
      };
    }
  | { type: 'UPDATE_POLICE_POSITION'; payload: { lat: number; lng: number; eta: number } }
  | { type: 'SET_POLICE_STATUS'; payload: { status: PoliceStatus; task?: string; arrivedAt?: string } }
  | { type: 'DISPATCH_TRAFFIC'; payload: { incidentId: string; destLat: number; destLng: number } }
  | {
      type: 'SET_TRAFFIC_ROUTE';
      payload: {
        route: [number, number][];
        distanceMeters: number;
        durationSeconds: number;
      };
    }
  | {
      type: 'UPDATE_TRAFFIC_POSITION';
      payload: {
        lat: number;
        lng: number;
        eta: number;
        speedKmh?: number;
        signalsOverride?: number;
      };
    }
  | {
      type: 'SET_TRAFFIC_STATUS';
      payload: {
        status: TrafficStatus;
        greenCorridorActive?: boolean;
        task?: string;
        signalsOverride?: number;
      };
    }
  | { type: 'ACTIVATE_GREEN_CORRIDOR'; payload: { route: [number, number][] } }
  | { type: 'DEACTIVATE_GREEN_CORRIDOR' }
  | {
      type: 'SELECT_HOSPITAL';
      payload: {
        hospital: Hospital;
        factors: HospitalSelectionFactors;
        incidentId: string;
      };
    }
  | {
      type: 'SET_HOSPITAL_STATUS';
      payload: {
        status: HospitalAgentStatus;
        timeField?: 'notifiedAt' | 'preparingAt' | 'readyAt' | 'patientReceivedAt';
      };
    }
  | { type: 'SET_HOSPITAL_PATIENT_RECEIVED' }
  | { type: 'SET_SYSTEM_STATUS'; payload: { status: SystemStatusType; message: string } }
  | { type: 'ADD_SYSTEM_LOG'; payload: Omit<SystemLog, 'id' | 'timestamp'> }
  | { type: 'SET_ACTIVE_TAB'; payload: 'COMMAND_CENTER' | 'SCENARIO_LAB' | 'PERFORMANCE' | 'ABOUT' }
  | { type: 'SET_PRESENTATION_MODE'; payload: boolean }
  | { type: 'SET_DEMO_STATE'; payload: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' }
  | { type: 'SET_DEMO_SPEED'; payload: 'NORMAL' | 'DEMO_SPEED' }
  | { type: 'SET_DEMO_SCENARIO'; payload: 'STANDARD' | 'HIGH_PRIORITY' }
  | { type: 'RESET_SYSTEM' };

export const initialAmbulanceState = {
  id: 'AMB-01',
  status: 'AVAILABLE' as AmbulanceStatus,
  latitude: AMBULANCE_DEPOT.latitude,
  longitude: AMBULANCE_DEPOT.longitude,
  depotLatitude: AMBULANCE_DEPOT.latitude,
  depotLongitude: AMBULANCE_DEPOT.longitude,
  destinationLatitude: null,
  destinationLongitude: null,
  assignedIncidentId: null,
  route: [],
  routeDistance: null,
  routeDuration: null,
  eta: null,
  currentTask: 'STANDBY',
  dispatchedAt: null,
  arrivedAt: null,
  leg: 'SCENE' as 'SCENE' | 'HOSPITAL',
};

export const initialPoliceState = {
  id: 'POL-01',
  status: 'AVAILABLE' as PoliceStatus,
  latitude: POLICE_DEPOT.latitude,
  longitude: POLICE_DEPOT.longitude,
  depotLatitude: POLICE_DEPOT.latitude,
  depotLongitude: POLICE_DEPOT.longitude,
  destinationLatitude: null,
  destinationLongitude: null,
  assignedIncidentId: null,
  route: [],
  routeDistance: null,
  routeDuration: null,
  eta: null,
  currentTask: 'STANDBY',
  dispatchedAt: null,
  arrivedAt: null,
};

export const initialTrafficState: Traffic = {
  id: 'TR-07',
  status: 'STANDBY' as TrafficStatus,
  latitude: TRAFFIC_DEPOT.latitude,
  longitude: TRAFFIC_DEPOT.longitude,
  depotLatitude: TRAFFIC_DEPOT.latitude,
  depotLongitude: TRAFFIC_DEPOT.longitude,
  destinationLatitude: null,
  destinationLongitude: null,
  assignedIncidentId: null,
  greenCorridorActive: false,
  activatedAt: null,
  affectedRoute: null,
  route: [],
  routeDistance: null,
  routeDuration: null,
  eta: null,
  currentTask: 'STANDBY',
  speedKmh: 0,
  activeSignalsOverrideCount: 0,
};

export const initialHospitalState: HospitalState = {
  selectedHospital: null,
  status: 'NO_HOSPITAL_SELECTED',
  notifiedAt: null,
  preparingAt: null,
  readyAt: null,
  patientReceivedAt: null,
  assignedIncidentId: null,
  selectionFactors: null,
  allHospitals: INITIAL_HOSPITALS,
};

export const initialPredictionState: PredictionState = {
  status: 'IDLE',
  lastUpdated: null,
  trafficImpact: null,
  responseRisk: null,
  hospitalDemand: null,
  predictedResponseTimeMinutes: null,
  recommendedMonitoring: [],
  source: null,
};

export const initialUrsaiState: UrsaiState = {
  systemStatus: 'SYSTEM_OPERATIONAL',
  statusMessage: 'URSAI AI Command Core active. Monitoring Chennai sector feeds.',
  activeIncident: null,
  ambulance: { ...initialAmbulanceState },
  police: { ...initialPoliceState },
  traffic: { ...initialTrafficState },
  hospital: { ...initialHospitalState },
  aiDecision: null,
  aiStatus: 'IDLE',
  prediction: { ...initialPredictionState },
  cityState: { ...INITIAL_CITY_STATE },
  mission: null,
  optimization: null,
  mapSelection: {
    isSelectingLocation: false,
    selectedLocation: null,
  },
  logs: [
    {
      id: 'log-init',
      timestamp: new Date().toISOString(),
      message: 'URSAI Command Core initialized with NVIDIA NIM Decision Engine, Real-Time City Data Simulation & Adaptive Multi-Agent Coordinator.',
      type: 'info',
      source: 'SYSTEM',
    },
  ],
  simulationGeneration: 1,
  dataSourceMode: 'HYBRID',
  activeTab: 'COMMAND_CENTER',
  isPresentationMode: false,
  demoState: 'IDLE',
  demoSpeed: 'NORMAL',
  demoScenario: 'STANDARD',
};

export function ursaiReducer(state: UrsaiState, action: UrsaiAction): UrsaiState {
  switch (action.type) {
    case 'SET_DATA_SOURCE_MODE':
      return {
        ...state,
        dataSourceMode: action.payload,
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `DATA SOURCE ENGINE: Switched operational mode to ${action.payload}`,
            type: 'info',
            source: 'CITY_ENGINE',
          },
          ...state.logs,
        ],
      };
    case 'SET_MAP_SELECTION_MODE':
      return {
        ...state,
        mapSelection: {
          ...state.mapSelection,
          isSelectingLocation: action.payload,
        },
      };

    case 'SET_SELECTED_LOCATION':
      return {
        ...state,
        mapSelection: {
          ...state.mapSelection,
          selectedLocation: action.payload,
        },
      };

    case 'CREATE_INCIDENT':
      return {
        ...state,
        simulationGeneration: state.simulationGeneration + 1,
        activeIncident: action.payload,
        aiStatus: 'ANALYZING',
        aiDecision: null,
        ambulance: { ...initialAmbulanceState },
        police: { ...initialPoliceState },
        traffic: { ...initialTrafficState },
        hospital: { ...initialHospitalState },
        prediction: { ...initialPredictionState },
        mission: null,
        optimization: null,
        mapSelection: {
          isSelectingLocation: false,
          selectedLocation: null,
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `INCIDENT DETECTED: ${action.payload.id} [${action.payload.type} - ${action.payload.severity}] at ${action.payload.latitude.toFixed(4)}, ${action.payload.longitude.toFixed(4)}`,
            type: action.payload.severity === 'CRITICAL' || action.payload.severity === 'HIGH' ? 'danger' : 'warning',
            source: 'INCIDENT',
          },
          ...state.logs,
        ],
      };

    case 'UPDATE_INCIDENT_STATUS':
      if (!state.activeIncident) return state;
      return {
        ...state,
        activeIncident: {
          ...state.activeIncident,
          status: action.payload,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'SET_AI_ANALYSIS_STARTED':
      return {
        ...state,
        aiStatus: 'ANALYZING',
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: 'NVIDIA NIM AI DECISION ENGINE: Evaluating emergency parameters & swarm allocation...',
            type: 'info',
            source: 'NIM_ENGINE',
          },
          ...state.logs,
        ],
      };

    case 'SET_AI_DECISION': {
      const decision = action.payload;
      const isFallback = decision.engine === 'FALLBACK RULE ENGINE';
      return {
        ...state,
        aiDecision: decision,
        aiStatus: decision.status,
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `AI DECISION COMPLETED [${decision.engine}]: Severity=${decision.severity}, Priority=${decision.priority}. Agents: [${decision.requiredAgents.join(', ')}]. GreenCorridor=${decision.greenCorridor}.`,
            type: isFallback ? 'warning' : 'success',
            source: 'NIM_ENGINE',
          },
          ...state.logs,
        ],
      };
    }

    case 'START_PREDICTION_ANALYSIS':
      return {
        ...state,
        prediction: {
          ...state.prediction,
          status: 'ANALYZING',
        },
      };

    case 'SET_PREDICTION_RESULT': {
      const { prediction, source, simulationGeneration } = action.payload;
      if (simulationGeneration !== state.simulationGeneration) return state;

      const isFallback = source === 'RULE_BASED_FALLBACK';
      return {
        ...state,
        prediction: {
          status: 'READY',
          lastUpdated: new Date().toISOString(),
          trafficImpact: prediction.trafficImpact,
          responseRisk: prediction.responseRisk,
          hospitalDemand: prediction.hospitalDemand,
          predictedResponseTimeMinutes: prediction.predictedResponseTimeMinutes,
          recommendedMonitoring: prediction.recommendedMonitoring,
          source,
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `PREDICTIVE INTELLIGENCE INSIGHT [${source}]: Traffic=${prediction.trafficImpact.level}, Risk=${prediction.responseRisk.level}, HospitalDemand=${prediction.hospitalDemand.level}, Est. Response=${prediction.predictedResponseTimeMinutes}m.`,
            type: isFallback ? 'warning' : 'info',
            source: 'PREDICTIVE_ENGINE',
          },
          ...state.logs,
        ],
      };
    }

    case 'SET_PREDICTION_FAILED':
      return {
        ...state,
        prediction: {
          ...state.prediction,
          status: 'FAILED',
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `PREDICTIVE ENGINE DEGRADED: ${action.payload}`,
            type: 'warning',
            source: 'PREDICTIVE_ENGINE',
          },
          ...state.logs,
        ],
      };

    case 'CLEAR_PREDICTION':
      return {
        ...state,
        prediction: { ...initialPredictionState },
      };

    case 'UPDATE_CITY_STATE':
      return {
        ...state,
        cityState: action.payload,
      };

    case 'SET_MISSION_PLAN':
      return {
        ...state,
        mission: action.payload.mission,
        optimization: action.payload.optimization || state.optimization,
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `MISSION BASELINE ESTABLISHED [${action.payload.mission.id}]: Plan v${action.payload.plan.version} generated. Reason: ${action.payload.plan.reason}`,
            type: 'info',
            source: 'SYSTEM',
          },
          ...state.logs,
        ],
      };

    case 'UPDATE_MISSION_PLAN': {
      if (!state.mission) return state;
      const updatedMission: Mission = {
        ...state.mission,
        currentPlan: action.payload.plan,
        planVersion: action.payload.plan.version,
        planStatus: (action.payload.plan.status as PlanStatus) || 'UPDATED',
        replanningCount: state.mission.replanningCount + 1,
        lastReplannedAt: new Date().toISOString(),
      };

      return {
        ...state,
        mission: updatedMission,
        optimization: action.payload.optimization || state.optimization,
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `ADAPTIVE REPLAN EXECUTED [Mission ${state.mission.id} -> v${action.payload.plan.version}]: ${action.payload.reason}`,
            type: 'warning',
            source: 'NIM_ENGINE',
          },
          ...state.logs,
        ],
      };
    }

    case 'SET_MISSION_STATUS': {
      if (!state.mission) return state;
      return {
        ...state,
        mission: {
          ...state.mission,
          status: action.payload.status,
          planStatus: action.payload.planStatus || state.mission.planStatus,
        },
      };
    }

    case 'UPDATE_OPTIMIZATION':
      return {
        ...state,
        optimization: action.payload,
      };

    case 'DISPATCH_AMBULANCE':
      return {
        ...state,
        ambulance: {
          ...state.ambulance,
          status: 'DISPATCHED',
          assignedIncidentId: action.payload.incidentId,
          destinationLatitude: action.payload.destLat,
          destinationLongitude: action.payload.destLng,
          dispatchedAt: new Date().toISOString(),
          currentTask: 'DISPATCHED TO INCIDENT',
          latitude: state.ambulance.depotLatitude,
          longitude: state.ambulance.depotLongitude,
          leg: 'SCENE',
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `AMBULANCE DISPATCHED: Unit AMB-01 assigned to incident ${action.payload.incidentId}`,
            type: 'info',
            source: 'AMBULANCE',
          },
          ...state.logs,
        ],
      };

    case 'SET_AMBULANCE_ROUTE':
      return {
        ...state,
        ambulance: {
          ...state.ambulance,
          status: 'EN_ROUTE',
          route: action.payload.route,
          routeDistance: action.payload.distanceMeters,
          routeDuration: action.payload.durationSeconds,
          eta: action.payload.durationSeconds,
          currentTask: 'RESPONDING TO SCENE',
          leg: action.payload.leg || 'SCENE',
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `AMBULANCE ROUTE CALCULATED (Leg 1): ${(action.payload.distanceMeters / 1000).toFixed(1)} km, ETA ~${Math.round(action.payload.durationSeconds / 60)} mins`,
            type: 'info',
            source: 'AMBULANCE',
          },
          ...state.logs,
        ],
      };

    case 'SET_AMBULANCE_HOSPITAL_ROUTE':
      return {
        ...state,
        ambulance: {
          ...state.ambulance,
          status: 'TRANSPORTING',
          route: action.payload.route,
          routeDistance: action.payload.distanceMeters,
          routeDuration: action.payload.durationSeconds,
          eta: action.payload.durationSeconds,
          currentTask: `PATIENT TRANSPORT TO ${action.payload.hospital.name.toUpperCase()}`,
          destinationLatitude: action.payload.hospital.latitude,
          destinationLongitude: action.payload.hospital.longitude,
          leg: 'HOSPITAL',
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `HOSPITAL TRANSPORT ROUTE ACTIVATED (Leg 2): Transporting patient to ${action.payload.hospital.name} [${(action.payload.distanceMeters / 1000).toFixed(1)} km].`,
            type: 'info',
            source: 'AMBULANCE',
          },
          ...state.logs,
        ],
      };

    case 'UPDATE_AMBULANCE_POSITION':
      return {
        ...state,
        ambulance: {
          ...state.ambulance,
          latitude: action.payload.lat,
          longitude: action.payload.lng,
          eta: Math.max(0, action.payload.eta),
        },
      };

    case 'SET_AMBULANCE_STATUS':
      return {
        ...state,
        ambulance: {
          ...state.ambulance,
          status: action.payload.status,
          currentTask: action.payload.task || state.ambulance.currentTask,
          arrivedAt: action.payload.arrivedAt || state.ambulance.arrivedAt,
        },
        logs: action.payload.status === 'AT_SCENE'
          ? [
              {
                id: `log-${Date.now()}-${Math.random()}`,
                timestamp: new Date().toISOString(),
                message: `AMBULANCE AT SCENE: AMB-01 arrived at incident location. Triage and medical stabilization initiated.`,
                type: 'success',
                source: 'AMBULANCE',
              },
              ...state.logs,
            ]
          : state.logs,
      };

    case 'DISPATCH_POLICE':
      return {
        ...state,
        police: {
          ...state.police,
          status: 'DISPATCHED',
          assignedIncidentId: action.payload.incidentId,
          destinationLatitude: action.payload.destLat,
          destinationLongitude: action.payload.destLng,
          dispatchedAt: new Date().toISOString(),
          currentTask: 'DISPATCHED TO INCIDENT',
          latitude: state.police.depotLatitude,
          longitude: state.police.depotLongitude,
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `POLICE DISPATCHED: Unit POL-01 assigned to incident ${action.payload.incidentId}`,
            type: 'info',
            source: 'POLICE',
          },
          ...state.logs,
        ],
      };

    case 'SET_POLICE_ROUTE':
      return {
        ...state,
        police: {
          ...state.police,
          status: 'EN_ROUTE',
          route: action.payload.route,
          routeDistance: action.payload.distanceMeters,
          routeDuration: action.payload.durationSeconds,
          eta: action.payload.durationSeconds,
          currentTask: 'RESPONDING EN ROUTE',
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `POLICE ROUTE CALCULATED: ${(action.payload.distanceMeters / 1000).toFixed(1)} km, ETA ~${Math.round(action.payload.durationSeconds / 60)} mins`,
            type: 'info',
            source: 'POLICE',
          },
          ...state.logs,
        ],
      };

    case 'UPDATE_POLICE_POSITION':
      return {
        ...state,
        police: {
          ...state.police,
          latitude: action.payload.lat,
          longitude: action.payload.lng,
          eta: Math.max(0, action.payload.eta),
        },
      };

    case 'SET_POLICE_STATUS':
      return {
        ...state,
        police: {
          ...state.police,
          status: action.payload.status,
          currentTask: action.payload.task || state.police.currentTask,
          arrivedAt: action.payload.arrivedAt || state.police.arrivedAt,
        },
        logs: action.payload.status === 'ON_SCENE'
          ? [
              {
                id: `log-${Date.now()}-${Math.random()}`,
                timestamp: new Date().toISOString(),
                message: `POLICE ON SCENE: POL-01 arrived at incident location. Perimeter secured & traffic control active.`,
                type: 'success',
                source: 'POLICE',
              },
              ...state.logs,
            ]
          : state.logs,
      };

    case 'DISPATCH_TRAFFIC':
      return {
        ...state,
        traffic: {
          ...state.traffic,
          status: 'RESPONDING',
          assignedIncidentId: action.payload.incidentId,
          destinationLatitude: action.payload.destLat,
          destinationLongitude: action.payload.destLng,
          currentTask: 'DEPLOYING RAPID GREEN CORRIDOR PILOT UNIT',
          latitude: state.traffic.depotLatitude,
          longitude: state.traffic.depotLongitude,
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `TRAFFIC AGENT DISPATCHED: Pilot unit TR-07 deploying along emergency corridor to secure signals.`,
            type: 'info',
            source: 'TRAFFIC',
          },
          ...state.logs,
        ],
      };

    case 'SET_TRAFFIC_ROUTE':
      return {
        ...state,
        traffic: {
          ...state.traffic,
          status: 'RESPONDING',
          route: action.payload.route,
          routeDistance: action.payload.distanceMeters,
          routeDuration: action.payload.durationSeconds,
          eta: action.payload.durationSeconds,
          currentTask: 'SYNCHRONIZING SCATS SIGNALS & CLEARING CORRIDOR',
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `TRAFFIC PILOT ROUTE ENGAGED: Preempting ${(action.payload.distanceMeters / 1000).toFixed(1)} km corridor, estimated clearance ETA ~${Math.round(action.payload.durationSeconds / 60)} mins`,
            type: 'info',
            source: 'TRAFFIC',
          },
          ...state.logs,
        ],
      };

    case 'UPDATE_TRAFFIC_POSITION':
      return {
        ...state,
        traffic: {
          ...state.traffic,
          latitude: action.payload.lat,
          longitude: action.payload.lng,
          eta: Math.max(0, action.payload.eta),
          speedKmh: action.payload.speedKmh ?? state.traffic.speedKmh,
          activeSignalsOverrideCount: action.payload.signalsOverride ?? state.traffic.activeSignalsOverrideCount,
        },
      };

    case 'SET_TRAFFIC_STATUS':
      return {
        ...state,
        traffic: {
          ...state.traffic,
          status: action.payload.status,
          greenCorridorActive: action.payload.greenCorridorActive ?? state.traffic.greenCorridorActive,
          currentTask: action.payload.task ?? state.traffic.currentTask,
          activeSignalsOverrideCount: action.payload.signalsOverride ?? state.traffic.activeSignalsOverrideCount,
        },
      };

    case 'ACTIVATE_GREEN_CORRIDOR':
      return {
        ...state,
        traffic: {
          ...state.traffic,
          status: 'GREEN_CORRIDOR_ACTIVE',
          assignedIncidentId: state.activeIncident?.id || null,
          greenCorridorActive: true,
          activatedAt: new Date().toISOString(),
          affectedRoute: action.payload.route,
          currentTask: 'HOLDING GREEN WAVE CORRIDOR & PERIMETER TRAFFIC CONTROL',
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `GREEN CORRIDOR ACTIVATED: Priority traffic signal override engaged along emergency transit path.`,
            type: 'success',
            source: 'TRAFFIC',
          },
          ...state.logs,
        ],
      };

    case 'DEACTIVATE_GREEN_CORRIDOR':
      return {
        ...state,
        traffic: {
          ...state.traffic,
          status: 'STANDBY',
          greenCorridorActive: false,
          affectedRoute: null,
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: 'GREEN CORRIDOR DEACTIVATED: Emergency corridor restored to normal signal rhythm.',
            type: 'info',
            source: 'TRAFFIC',
          },
          ...state.logs,
        ],
      };

    case 'SELECT_HOSPITAL':
      return {
        ...state,
        hospital: {
          ...state.hospital,
          selectedHospital: action.payload.hospital,
          status: 'SELECTED',
          assignedIncidentId: action.payload.incidentId,
          selectionFactors: action.payload.factors,
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `HOSPITAL SELECTED: ${action.payload.hospital.name} [Dist: ${action.payload.factors.distanceKm}km, Score: ${action.payload.factors.totalScore}/250]. Emergency notification sent.`,
            type: 'info',
            source: 'HOSPITAL',
          },
          ...state.logs,
        ],
      };

    case 'SET_HOSPITAL_STATUS': {
      const { status, timeField } = action.payload;
      return {
        ...state,
        hospital: {
          ...state.hospital,
          status,
          ...(timeField ? { [timeField]: new Date().toISOString() } : {}),
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `HOSPITAL AGENT STATUS UPDATE: ${state.hospital.selectedHospital?.name || 'Selected Center'} -> ${status}`,
            type: status === 'READY' ? 'success' : 'info',
            source: 'HOSPITAL',
          },
          ...state.logs,
        ],
      };
    }

    case 'SET_HOSPITAL_PATIENT_RECEIVED':
      return {
        ...state,
        hospital: {
          ...state.hospital,
          status: 'PATIENT_RECEIVED',
          patientReceivedAt: new Date().toISOString(),
        },
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: `PATIENT RECEIVED: ${state.hospital.selectedHospital?.name || 'Emergency Center'} confirmed patient handoff. Emergency cycle resolved.`,
            type: 'success',
            source: 'HOSPITAL',
          },
          ...state.logs,
        ],
      };

    case 'SET_SYSTEM_STATUS':
      return {
        ...state,
        systemStatus: action.payload.status,
        statusMessage: action.payload.message,
      };

    case 'ADD_SYSTEM_LOG':
      return {
        ...state,
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            ...action.payload,
          },
          ...state.logs,
        ],
      };

    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.payload,
      };

    case 'SET_PRESENTATION_MODE':
      return {
        ...state,
        isPresentationMode: action.payload,
      };

    case 'SET_DEMO_STATE':
      return {
        ...state,
        demoState: action.payload,
      };

    case 'SET_DEMO_SPEED':
      return {
        ...state,
        demoSpeed: action.payload,
      };

    case 'SET_DEMO_SCENARIO':
      return {
        ...state,
        demoScenario: action.payload,
      };

    case 'RESET_SYSTEM':
      return {
        ...initialUrsaiState,
        activeTab: state.activeTab || 'COMMAND_CENTER',
        isPresentationMode: state.isPresentationMode || false,
        demoSpeed: state.demoSpeed || 'NORMAL',
        demoScenario: state.demoScenario || 'STANDARD',
        demoState: 'IDLE',
        simulationGeneration: state.simulationGeneration + 1,
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            message: 'SYSTEM RESET EXECUTED: All active incidents cleared. Swarm agents returned to depots.',
            type: 'info',
            source: 'SYSTEM',
          },
          ...state.logs,
        ],
      };

    default:
      return state;
  }
}
