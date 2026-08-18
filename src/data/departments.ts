export type DepartmentId =
  | 'EMS'
  | 'POLICE'
  | 'FIRE_RESCUE'
  | 'TRAFFIC'
  | 'HOSPITAL'
  | 'DISASTER_MANAGEMENT'
  | 'PUBLIC_WORKS'
  | 'ELECTRICITY'
  | 'WATER_SEWERAGE'
  | 'WEATHER_ENV'
  | 'EMERGENCY_COMMS'
  | 'CITY_ADMIN';

export type DepartmentCategory = 'CORE' | 'SUPPORT' | 'MONITOR';

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  shortName: string;
  category: DepartmentCategory;
  iconName: string; // Lucide icon reference
  color: string; // Tailwind color class or hex
  bgClass: string;
  borderClass: string;
  textClass: string;
  responsibilities: string[];
  travelsOnMap: boolean; // True if physical unit moves on map
  defaultUnitsAvailable: number;
}

export const DEPARTMENTS_REGISTRY: Record<DepartmentId, DepartmentInfo> = {
  EMS: {
    id: 'EMS',
    name: 'EMS / Ambulance Service',
    shortName: 'EMS',
    category: 'CORE',
    iconName: 'Ambulance',
    color: '#ef4444',
    bgClass: 'bg-red-950/60',
    borderClass: 'border-red-800',
    textClass: 'text-red-400',
    responsibilities: [
      'Medical emergency response',
      'Patient triage & stabilization',
      'Emergency transport to hospital ER',
      'On-scene paramedic support',
    ],
    travelsOnMap: true,
    defaultUnitsAvailable: 4,
  },
  POLICE: {
    id: 'POLICE',
    name: 'Police Department',
    shortName: 'POLICE',
    category: 'CORE',
    iconName: 'Shield',
    color: '#3b82f6',
    bgClass: 'bg-blue-950/60',
    borderClass: 'border-blue-800',
    textClass: 'text-blue-400',
    responsibilities: [
      'Scene perimeter security',
      'Traffic cordoning & public safety',
      'Accident investigation',
      'Simulated road clearance coordination',
    ],
    travelsOnMap: true,
    defaultUnitsAvailable: 5,
  },
  FIRE_RESCUE: {
    id: 'FIRE_RESCUE',
    name: 'Fire & Rescue Services',
    shortName: 'FIRE',
    category: 'CORE',
    iconName: 'Flame',
    color: '#f97316',
    bgClass: 'bg-orange-950/60',
    borderClass: 'border-orange-800',
    textClass: 'text-orange-400',
    responsibilities: [
      'Structural & chemical fire suppression',
      'Vehicle extraction & heavy rescue',
      'Hazardous material containment',
      'Building collapse rescue support',
    ],
    travelsOnMap: true,
    defaultUnitsAvailable: 3,
  },
  TRAFFIC: {
    id: 'TRAFFIC',
    name: 'Traffic Management Bureau',
    shortName: 'TRAFFIC',
    category: 'CORE',
    iconName: 'Activity',
    color: '#10b981',
    bgClass: 'bg-emerald-950/60',
    borderClass: 'border-emerald-800',
    textClass: 'text-emerald-400',
    responsibilities: [
      'Traffic signal timing & preemption',
      'Green Corridor wave activation',
      'Arterial congestion rerouting',
      'Real-time speed sensor monitoring',
    ],
    travelsOnMap: false,
    defaultUnitsAvailable: 6,
  },
  HOSPITAL: {
    id: 'HOSPITAL',
    name: 'Hospital & Medical Facilities',
    shortName: 'HOSPITAL',
    category: 'CORE',
    iconName: 'Building2',
    color: '#a855f7',
    bgClass: 'bg-purple-950/60',
    borderClass: 'border-purple-800',
    textClass: 'text-purple-400',
    responsibilities: [
      'Emergency room intake readiness',
      'ICU bed capacity tracking',
      'Trauma surgical team alert',
      'Patient transfer receiving',
    ],
    travelsOnMap: false,
    defaultUnitsAvailable: 4,
  },
  DISASTER_MANAGEMENT: {
    id: 'DISASTER_MANAGEMENT',
    name: 'Disaster Management Authority',
    shortName: 'DISASTER',
    category: 'SUPPORT',
    iconName: 'AlertTriangle',
    color: '#eab308',
    bgClass: 'bg-yellow-950/60',
    borderClass: 'border-yellow-800',
    textClass: 'text-yellow-400',
    responsibilities: [
      'Large-scale disaster coordination',
      'City shelter & evacuation operations',
      'Multi-agency resource prioritization',
      'State-level emergency escalation',
    ],
    travelsOnMap: false,
    defaultUnitsAvailable: 2,
  },
  PUBLIC_WORKS: {
    id: 'PUBLIC_WORKS',
    name: 'Public Works & Infrastructure',
    shortName: 'ROADS',
    category: 'SUPPORT',
    iconName: 'Wrench',
    color: '#06b6d4',
    bgClass: 'bg-cyan-950/60',
    borderClass: 'border-cyan-800',
    textClass: 'text-cyan-400',
    responsibilities: [
      'Road obstruction & debris clearing',
      'Tree removal & structural repair',
      'Bridge & culvert integrity check',
      'Pavement emergency restoration',
    ],
    travelsOnMap: true,
    defaultUnitsAvailable: 3,
  },
  ELECTRICITY: {
    id: 'ELECTRICITY',
    name: 'Electricity & Power Utility',
    shortName: 'POWER',
    category: 'SUPPORT',
    iconName: 'Zap',
    color: '#38bdf8',
    bgClass: 'bg-sky-950/60',
    borderClass: 'border-sky-800',
    textClass: 'text-sky-400',
    responsibilities: [
      'High-voltage hazard isolation',
      'Grid power shutdown in flood zones',
      'Substation fault emergency repair',
      'Feeder line restoration',
    ],
    travelsOnMap: true,
    defaultUnitsAvailable: 3,
  },
  WATER_SEWERAGE: {
    id: 'WATER_SEWERAGE',
    name: 'Water & Sewerage Board',
    shortName: 'WATER',
    category: 'SUPPORT',
    iconName: 'Droplets',
    color: '#2563eb',
    bgClass: 'bg-blue-950/80',
    borderClass: 'border-blue-700',
    textClass: 'text-blue-300',
    responsibilities: [
      'Drainage pump deployment',
      'Stormwater canal clearing',
      'Water main rupture isolation',
      'Sewage overflow mitigation',
    ],
    travelsOnMap: true,
    defaultUnitsAvailable: 3,
  },
  WEATHER_ENV: {
    id: 'WEATHER_ENV',
    name: 'Weather & Environment Agency',
    shortName: 'WEATHER',
    category: 'MONITOR',
    iconName: 'CloudRain',
    color: '#64748b',
    bgClass: 'bg-slate-900',
    borderClass: 'border-slate-700',
    textClass: 'text-slate-300',
    responsibilities: [
      'Rainfall & flood surge forecasting',
      'Monsoon gale wind advisories',
      'Air quality hazard monitoring',
      'Real-time Doppler radar feed',
    ],
    travelsOnMap: false,
    defaultUnitsAvailable: 1,
  },
  EMERGENCY_COMMS: {
    id: 'EMERGENCY_COMMS',
    name: 'Emergency Communications Network',
    shortName: 'COMMS',
    category: 'MONITOR',
    iconName: 'Radio',
    color: '#14b8a6',
    bgClass: 'bg-teal-950/60',
    borderClass: 'border-teal-800',
    textClass: 'text-teal-400',
    responsibilities: [
      'Inter-department event bus routing',
      'First-responder radio telemetry',
      'Public warning broadcast',
      'Cross-department sync validation',
    ],
    travelsOnMap: false,
    defaultUnitsAvailable: 1,
  },
  CITY_ADMIN: {
    id: 'CITY_ADMIN',
    name: 'City Command & Administration',
    shortName: 'COMMAND',
    category: 'MONITOR',
    iconName: 'Landmark',
    color: '#ec4899',
    bgClass: 'bg-pink-950/60',
    borderClass: 'border-pink-800',
    textClass: 'text-pink-400',
    responsibilities: [
      'Executive situation overview',
      'Municipal budget resource allocation',
      'State press advisory dispatch',
      'Inter-department policy enforcement',
    ],
    travelsOnMap: false,
    defaultUnitsAvailable: 1,
  },
};

export const DEPARTMENT_LIST: DepartmentInfo[] = Object.values(DEPARTMENTS_REGISTRY);
