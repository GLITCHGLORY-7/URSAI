import { Hospital } from '../data/hospitals';
export type { Hospital };

export type IncidentType = 'ROAD ACCIDENT' | 'FIRE' | 'FLOOD' | 'ROAD BLOCKAGE';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus =
  | 'DETECTED'
  | 'ANALYZING'
  | 'ACTIVE'
  | 'RESPONSE_IN_PROGRESS'
  | 'RESOLVED'
  | 'FAILED';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: Severity;
  latitude: number;
  longitude: number;
  description: string;
  status: IncidentStatus;
  selectedHospitalId?: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type AmbulanceStatus =
  | 'AVAILABLE'
  | 'DISPATCHED'
  | 'ROUTING'
  | 'EN_ROUTE'
  | 'AT_SCENE'
  | 'TRANSPORTING'
  | 'ARRIVED_AT_HOSPITAL'
  | 'ERROR';

export type AmbulanceTask =
  | 'STANDBY'
  | 'DISPATCHED TO INCIDENT'
  | 'RESPOND_TO_INCIDENT'
  | 'ON_SCENE'
  | 'TRANSPORT_PATIENT'
  | 'AT_HOSPITAL'
  | 'ROUTING FAILURE';

export interface Ambulance {
  id: string;
  status: AmbulanceStatus;
  latitude: number;
  longitude: number;
  depotLatitude: number;
  depotLongitude: number;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  assignedIncidentId: string | null;
  route: [number, number][]; // [lat, lng][]
  routeDistance: number | null; // meters
  routeDuration: number | null; // seconds
  eta: number | null; // seconds remaining
  currentTask: AmbulanceTask | string;
  dispatchedAt: string | null;
  arrivedAt: string | null;
  leg: 'SCENE' | 'HOSPITAL'; // leg 1 (to scene) vs leg 2 (to hospital)
}

export type PoliceStatus =
  | 'AVAILABLE'
  | 'DISPATCHED'
  | 'ROUTING'
  | 'EN_ROUTE'
  | 'ON_SCENE'
  | 'ERROR';

export interface Police {
  id: string;
  status: PoliceStatus;
  latitude: number;
  longitude: number;
  depotLatitude: number;
  depotLongitude: number;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  assignedIncidentId: string | null;
  route: [number, number][]; // [lat, lng][]
  routeDistance: number | null; // meters
  routeDuration: number | null; // seconds
  eta: number | null; // seconds remaining
  currentTask: string | null;
  dispatchedAt: string | null;
  arrivedAt: string | null;
}

export type TrafficStatus = 'STANDBY' | 'RESPONDING' | 'GREEN_CORRIDOR_ACTIVE';

export interface Traffic {
  id: string;
  status: TrafficStatus;
  latitude: number;
  longitude: number;
  depotLatitude: number;
  depotLongitude: number;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  assignedIncidentId: string | null;
  greenCorridorActive: boolean;
  activatedAt: string | null;
  affectedRoute: [number, number][] | null;
  route: [number, number][];
  routeDistance: number | null;
  routeDuration: number | null;
  eta: number | null;
  currentTask: string | null;
  speedKmh: number;
  activeSignalsOverrideCount: number;
}

export type HospitalAgentStatus =
  | 'NO_HOSPITAL_SELECTED'
  | 'SELECTED'
  | 'NOTIFIED'
  | 'PREPARING'
  | 'READY'
  | 'PATIENT_RECEIVED';

export interface HospitalSelectionFactors {
  distanceKm: number;
  beds: number;
  icu: number;
  emergencyReady: boolean;
  totalScore: number;
}

export interface HospitalState {
  selectedHospital: Hospital | null;
  status: HospitalAgentStatus;
  notifiedAt: string | null;
  preparingAt: string | null;
  readyAt: string | null;
  patientReceivedAt: string | null;
  assignedIncidentId: string | null;
  selectionFactors: HospitalSelectionFactors | null;
  allHospitals: Hospital[];
}

export type AISeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AIPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RequiredAgent = 'AMBULANCE' | 'POLICE' | 'TRAFFIC' | 'HOSPITAL';
export type AIDecisionStatus = 'IDLE' | 'ANALYZING' | 'ACTIVE' | 'DEGRADED' | 'FAILED' | 'FALLBACK';

export interface AIDecision {
  severity: AISeverity;
  priority: AIPriority;
  requiredAgents: RequiredAgent[];
  hospitalRequired: boolean;
  greenCorridor: boolean;
  reason: string;
  engine: 'NVIDIA NIM' | 'FALLBACK RULE ENGINE';
  status: AIDecisionStatus;
  timestamp: string;
}

export type SystemStatusType = 'SYSTEM_OPERATIONAL' | 'SYSTEM_DEGRADED' | 'SYSTEM_RESPONDING';

export interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  source:
    | 'SYSTEM'
    | 'INCIDENT'
    | 'AMBULANCE'
    | 'POLICE'
    | 'TRAFFIC'
    | 'HOSPITAL'
    | 'NIM_ENGINE'
    | 'PREDICTIVE_ENGINE'
    | 'COORDINATOR'
    | 'CITY_ENGINE'
    | 'MISSION_MONITOR'
    | 'PLAN_EVALUATOR'
    | 'REPLANNER';
}

export interface MapSelectionState {
  isSelectingLocation: boolean;
  selectedLocation: { lat: number; lng: number } | null;
}

export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng]
  distanceMeters: number;
  durationSeconds: number;
  source: 'OSRM' | 'FALLBACK';
}

// ==========================================
// Phase 7: City Data Simulation Types
// ==========================================

export type TrafficLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type WeatherCondition = 'CLEAR' | 'CLOUDY' | 'LIGHT_RAIN' | 'HEAVY_RAIN';
export type RoadStatus = 'NORMAL' | 'CONGESTED' | 'BLOCKED' | 'EMERGENCY_CORRIDOR';
export type HospitalPressure = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RoadSegment {
  id: string;
  name: string;
  status: RoadStatus;
  congestionIndex: number; // 0.0 to 1.0
  averageSpeedKmh: number;
  blocked: boolean;
  updatedAt: string;
}

export interface TrafficCityData {
  overallLevel: TrafficLevel;
  averageSpeedKmh: number;
  congestionIndex: number; // 0.0 - 1.0
}

export interface WeatherCityData {
  condition: WeatherCondition;
  temperatureC: number;
  visibilityKm: number;
  rainIntensity: 'NONE' | 'LIGHT' | 'HEAVY';
}

export interface ResourceState {
  ambulancesAvailable: number;
  policeUnitsAvailable: number;
}

export interface CityState {
  timestamp: string;
  traffic: TrafficCityData;
  weather: WeatherCityData;
  roads: RoadSegment[];
  resources: ResourceState;
  hospitalPressure: HospitalPressure;
  affectedRoadsCount: number;
}

// ==========================================
// Predictive Intelligence Extensions
// ==========================================

export type PredictionLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PredictionStatus = 'IDLE' | 'ANALYZING' | 'READY' | 'DEGRADED' | 'FAILED';
export type PredictionSource = 'NVIDIA_NIM' | 'RULE_BASED_FALLBACK';

export interface PredictiveInsight {
  level: PredictionLevel;
  description: string;
}

export interface PredictionData {
  trafficImpact: PredictiveInsight;
  responseRisk: PredictiveInsight;
  hospitalDemand: PredictiveInsight;
  routeDifficulty: PredictiveInsight;
  predictedResponseTimeMinutes: number;
  recommendedMonitoring: string[];
  situationSummary: string;
}

export interface PredictionState {
  status: PredictionStatus;
  lastUpdated: string | null;
  trafficImpact: PredictiveInsight | null;
  responseRisk: PredictiveInsight | null;
  hospitalDemand: PredictiveInsight | null;
  routeDifficulty?: PredictiveInsight | null;
  predictedResponseTimeMinutes: number | null;
  recommendedMonitoring: string[];
  situationSummary?: string | null;
  source: PredictionSource | null;
}

// ==========================================
// Phase 8: Adaptive Mission Coordination Types
// ==========================================

export type MissionStatus = 'CREATED' | 'ACTIVE' | 'ADAPTING' | 'EXECUTING' | 'COMPLETED' | 'CANCELLED';
export type PlanStatus = 'VALID' | 'REVIEW_REQUIRED' | 'REPLANNING' | 'UPDATED' | 'DEGRADED';

export interface PlanAction {
  agent: string;
  action: string;
  status: string;
}

export interface ResponsePlan {
  version: number;
  ambulance: {
    target: string;
    routeStatus: string;
  };
  police: {
    target: string;
    routeStatus: string;
  };
  traffic: {
    greenCorridor: boolean;
  };
  hospital: {
    id: string | null;
    status: string;
  };
  priorities: string[];
  createdAt: string;
  timestamp?: string;
  reason: string;
  status?: string;
  actions?: PlanAction[];
}

export interface Mission {
  id: string;
  simulationId: number;
  incidentId: string;
  status: MissionStatus;
  planStatus: PlanStatus;
  startedAt: string;
  currentPlan: ResponsePlan | null;
  planVersion: number;
  lastEvaluatedAt: string | null;
  lastReplannedAt?: string | null;
  replanningCount: number;
  lastReplanReason?: string;
}

export interface MissionOptimization {
  score: number; // 0-100
  factors: {
    responseTime: number;
    route: number;
    hospital: number;
    resources: number;
  };
  recommendation: 'CURRENT_PLAN' | 'OPTIMIZE_RECOMMENDED';
}

export type ReplanTarget = 'AMBULANCE' | 'POLICE' | 'TRAFFIC' | 'HOSPITAL';

export interface ReplanChange {
  target: ReplanTarget;
  action: string;
  reason: string;
}

export interface ReplanRecommendation {
  recommendation: 'KEEP_PLAN' | 'REPLAN';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  changes: ReplanChange[];
}

export interface UrsaiState {
  systemStatus: SystemStatusType;
  statusMessage: string;
  activeIncident: Incident | null;
  ambulance: Ambulance;
  police: Police;
  traffic: Traffic;
  hospital: HospitalState;
  aiDecision: AIDecision | null;
  aiStatus: AIDecisionStatus;
  prediction: PredictionState;
  cityState: CityState;
  mission: Mission | null;
  optimization: MissionOptimization | null;
  mapSelection: MapSelectionState;
  logs: SystemLog[];
  simulationGeneration: number; // Increment on reset to cancel stale tasks
  dataSourceMode?: DataSourceMode; // Phase 11: HYBRID | REAL | SIMULATED | FALLBACK
  activeTab?: 'COMMAND_CENTER' | 'SCENARIO_LAB' | 'SWARM_LAB' | 'STRESS_LAB' | 'PERFORMANCE' | 'ABOUT';
  isPresentationMode?: boolean;
  demoState?: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  demoSpeed?: 'NORMAL' | 'DEMO_SPEED';
  demoScenario?: 'STANDARD' | 'HIGH_PRIORITY';
}

// ==========================================
// Phase 11: Real-World Data Integration Types
// ==========================================

export type DataSourceType = 'REAL' | 'SIMULATED' | 'FALLBACK';
export type DataSourceMode = 'HYBRID' | 'REAL' | 'SIMULATED' | 'FALLBACK';
export type DataFreshness = 'FRESH' | 'STALE' | 'UNAVAILABLE' | 'FALLBACK' | 'SIMULATED';
export type AIDecisionConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export interface NormalizedTrafficData {
  congestionIndex: number; // 0.0 to 1.0
  overallLevel: TrafficLevel;
  averageSpeedKmh: number;
  affectedRoadsCount: number;
  timestamp: string;
  source: DataSourceType;
  freshness: DataFreshness;
  provider: string;
}

export interface NormalizedWeatherData {
  condition: WeatherCondition;
  temperatureC: number;
  visibilityKm: number;
  windSpeedKmh: number;
  rainIntensity: 'NONE' | 'LIGHT' | 'HEAVY';
  timestamp: string;
  source: DataSourceType;
  freshness: DataFreshness;
  provider: string;
}

export interface NormalizedHospitalData {
  hospitalId: string;
  name: string;
  latitude: number;
  longitude: number;
  bedsAvailable: number;
  icuBedsAvailable: number;
  emergencyReadiness: boolean;
  timestamp: string;
  source: DataSourceType;
  freshness: DataFreshness;
  provider: string;
}

export interface NormalizedResourceData {
  ambulancesAvailable: number;
  policeUnitsAvailable: number;
  trafficUnitsAvailable: number;
  timestamp: string;
  source: DataSourceType;
  freshness: DataFreshness;
  provider: string;
}

export interface NormalizedRoadData {
  roads: RoadSegment[];
  timestamp: string;
  source: DataSourceType;
  freshness: DataFreshness;
  provider: string;
}

export interface DataSourceStatusMap {
  mode: DataSourceMode;
  traffic: { source: DataSourceType; freshness: DataFreshness; provider: string };
  weather: { source: DataSourceType; freshness: DataFreshness; provider: string };
  hospital: { source: DataSourceType; freshness: DataFreshness; provider: string };
  resources: { source: DataSourceType; freshness: DataFreshness; provider: string };
  routing: { source: 'OSRM' | 'FALLBACK'; freshness: DataFreshness; provider: string };
  ai: { source: 'NVIDIA_NIM' | 'FALLBACK'; freshness: DataFreshness; provider: string };
}

export interface DataQualityReport {
  score: number; // 0-100
  status: 'GOOD' | 'FAIR' | 'POOR';
  factors: string[];
  label: 'DATA QUALITY' | 'SIMULATED DATA QUALITY';
}

export interface SituationReport {
  incidentSeverity: Severity | 'NONE';
  responseStatus: string;
  trafficImpact: string;
  ambulanceStatus: string;
  policeStatus: string;
  hospitalStatus: string;
  missionState: string;
  summary: string;
  timestamp: string;
}

export interface NormalizedAIContext {
  incident: Incident | null;
  traffic: NormalizedTrafficData;
  weather: NormalizedWeatherData;
  roadConditions: NormalizedRoadData;
  resources: NormalizedResourceData;
  hospitals: NormalizedHospitalData[];
  currentMission: Mission | null;
  currentPlan: ResponsePlan | null;
  predictions: PredictionData | null;
  dataQuality: DataQualityReport;
  sourcesSummary: Record<string, { source: string; freshness: string; provider: string }>;
}

export interface AIDecisionExplanation {
  decision: string;
  reason: string;
  dataSources: Record<string, string>;
  confidence: AIDecisionConfidence;
  confidenceFactors: string[];
}

// ==========================================
// Phase 12: Digital Twin & Scenario Intelligence Types
// ==========================================

export type ScenarioType =
  | 'TRAFFIC_INCREASE'
  | 'ROAD_BLOCKAGE'
  | 'HOSPITAL_CAPACITY_REDUCTION'
  | 'WEATHER_DETERIORATION'
  | 'AMBULANCE_DELAY'
  | 'GREEN_CORRIDOR_UNAVAILABLE';

export type ScenarioStatus = 'DRAFT' | 'SIMULATING' | 'COMPLETED' | 'FAILED';
export type ScenarioImpactCategory = 'LOW IMPACT' | 'MEDIUM IMPACT' | 'HIGH IMPACT' | 'CRITICAL IMPACT';
export type ScenarioAIRecommendation = 'KEEP_CURRENT_PLAN' | 'REVIEW_PLAN' | 'RECOMMEND_ALTERNATIVE';

export interface ScenarioParameters {
  trafficIncreasePercent?: number; // 10 to 50
  blockedRoadName?: string;
  hospitalCapacityReductionPercent?: number; // 10 to 90
  rainSeverity?: 'LIGHT' | 'HEAVY' | 'TORRENTIAL';
  ambulanceDelayMinutes?: number; // 1 to 10
  greenCorridorEnabled?: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  type: ScenarioType;
  description: string;
  params: ScenarioParameters;
  createdAt: string;
  baseMissionId: string | null;
  status: ScenarioStatus;
}

export interface ScenarioMetrics {
  etaSeconds: number;
  distanceMeters: number;
  responseTimeMinutes: number;
  hospitalSuitabilityScore: number;
  trafficImpactIndex: number;
  routeRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  missionRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resourceImpact: string;
}

export interface ScenarioEvaluationResult {
  scenario: Scenario;
  baseline: ScenarioMetrics;
  simulated: ScenarioMetrics;
  delta: {
    etaDeltaSeconds: number;
    distanceDeltaMeters: number;
    riskDelta: string;
    hospitalChanged: boolean;
    alternativeHospitalName?: string;
  };
  impactScore: number; // 0 - 100
  impactCategory: ScenarioImpactCategory;
  route: [number, number][]; // Scenario alternate route
  aiAnalysis: {
    recommendation: ScenarioAIRecommendation;
    reason: string;
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    keyRisks: string[];
  };
  provenance: {
    traffic: string;
    routing: string;
    hospital: string;
    ai: string;
  };
  whyItMatters: string;
  completedAt: string;
}

// ==========================================
// Phase 13: Evaluation & Benchmarking Types
// ==========================================

export interface MissionRunMetric {
  id: string;
  runNumber: number;
  incidentId: string;
  timestamp: string;
  totalResponseTimeSeconds: number;
  policeResponseTimeSeconds: number;
  hospitalTransferTimeSeconds: number;
  routeDistanceMeters: number;
  routeDurationSeconds: number;
  fallbackRoutingUsed: boolean;
  greenCorridorUsed: boolean;
  replanCount: number;
  hospitalSelectedTimeSeconds: number;
  aiEngineUsed: 'NVIDIA NIM' | 'FALLBACK RULE ENGINE';
  aiLatencyMs: number;
  aiConfidence: 'LOW' | 'MEDIUM' | 'HIGH';
  success: boolean;
  recovered: boolean;
  degraded: boolean;
  failureReason?: string;
}

export interface ExperimentConfig {
  id: string;
  runCount: number; // e.g. 10
  seed?: string;
  aiMode: 'NIM' | 'RULE_BASED' | 'HYBRID';
  scenarioType?: ScenarioType | 'NONE';
  withBaselineComparison: boolean;
}

export interface ExperimentAggregatedStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  recoveredRuns: number;
  successRatePercent: number; // 0 - 100
  meanResponseTimeSeconds: number;
  medianResponseTimeSeconds: number;
  minResponseTimeSeconds: number;
  maxResponseTimeSeconds: number;
  stdDevResponseTimeSeconds: number;
  baselineResponseTimeSeconds?: number;
  improvementPercent?: number; // Comparison vs baseline
  aiAvailabilityPercent: number;
  fallbackUsagePercent: number;
  averageReplanCount: number;
  recoveryTimeAverageSeconds: number;
}

export interface ExperimentReport {
  config: ExperimentConfig;
  summary: string;
  stats: ExperimentAggregatedStats;
  runs: MissionRunMetric[];
  scenarioResults?: Record<string, { etaDelta: number; impactCategory: string; recommendation: string }>;
  completedAt: string;
}


