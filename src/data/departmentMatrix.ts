import { IncidentType, Severity } from '../types/ursai';
import { DepartmentId } from './departments';

export interface DepartmentSelectionRule {
  incidentType: IncidentType;
  required: DepartmentId[];
  possible: DepartmentId[];
  optional: DepartmentId[];
  unnecessary: DepartmentId[];
  defaultEscalation: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
}

export const DEPARTMENT_DECISION_MATRIX: Record<IncidentType, DepartmentSelectionRule> = {
  'ROAD ACCIDENT': {
    incidentType: 'ROAD ACCIDENT',
    required: ['EMS', 'POLICE', 'TRAFFIC'],
    possible: ['HOSPITAL'],
    optional: ['FIRE_RESCUE', 'EMERGENCY_COMMS'],
    unnecessary: ['WATER_SEWERAGE', 'ELECTRICITY', 'DISASTER_MANAGEMENT', 'PUBLIC_WORKS', 'WEATHER_ENV', 'CITY_ADMIN'],
    defaultEscalation: 'NORMAL',
  },
  FIRE: {
    incidentType: 'FIRE',
    required: ['FIRE_RESCUE', 'POLICE', 'EMS'],
    possible: ['TRAFFIC', 'HOSPITAL'],
    optional: ['ELECTRICITY', 'EMERGENCY_COMMS'],
    unnecessary: ['WATER_SEWERAGE', 'PUBLIC_WORKS', 'DISASTER_MANAGEMENT', 'WEATHER_ENV', 'CITY_ADMIN'],
    defaultEscalation: 'ELEVATED',
  },
  FLOOD: {
    incidentType: 'FLOOD',
    required: ['DISASTER_MANAGEMENT', 'WATER_SEWERAGE', 'PUBLIC_WORKS'],
    possible: ['POLICE', 'TRAFFIC', 'EMS'],
    optional: ['WEATHER_ENV', 'EMERGENCY_COMMS', 'CITY_ADMIN', 'ELECTRICITY'],
    unnecessary: ['HOSPITAL', 'FIRE_RESCUE'],
    defaultEscalation: 'HIGH',
  },
  'ROAD BLOCKAGE': {
    incidentType: 'ROAD BLOCKAGE',
    required: ['TRAFFIC', 'PUBLIC_WORKS'],
    possible: ['POLICE'],
    optional: ['EMERGENCY_COMMS'],
    unnecessary: ['EMS', 'FIRE_RESCUE', 'HOSPITAL', 'DISASTER_MANAGEMENT', 'ELECTRICITY', 'WATER_SEWERAGE', 'WEATHER_ENV', 'CITY_ADMIN'],
    defaultEscalation: 'NORMAL',
  },
};

export interface EvaluatedDepartmentPlan {
  incidentId: string;
  incidentType: IncidentType;
  severity: Severity;
  escalationLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  requiredDepartments: DepartmentId[];
  optionalDepartments: DepartmentId[];
  departmentsNotRequired: DepartmentId[];
  tasks: Array<{ department: DepartmentId; task: string; targetETASeconds: number }>;
  dependencies: Array<{ department: DepartmentId; dependsOn: DepartmentId; condition: string }>;
  reasoning: string;
}

/**
 * Evaluates required, optional, and unnecessary departments deterministically based on incident attributes,
 * severity escalation, and environmental conditions.
 */
export function evaluateDepartmentSelection(
  incidentId: string,
  incidentType: IncidentType,
  severity: Severity,
  isHighRiskZone: boolean = false
): EvaluatedDepartmentPlan {
  const matrixRule = DEPARTMENT_DECISION_MATRIX[incidentType] || DEPARTMENT_DECISION_MATRIX['ROAD ACCIDENT'];

  let required = [...matrixRule.required];
  let optional = [...matrixRule.optional, ...matrixRule.possible];
  let unnecessary = [...matrixRule.unnecessary];

  let escalationLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL' = matrixRule.defaultEscalation;

  // Escalation logic based on Severity
  if (severity === 'CRITICAL') {
    escalationLevel = 'CRITICAL';
    // On CRITICAL severity, move possible/optional departments to required (e.g. Hospital & Disaster Management)
    if (matrixRule.possible.includes('HOSPITAL') && !required.includes('HOSPITAL')) {
      required.push('HOSPITAL');
      optional = optional.filter((d) => d !== 'HOSPITAL');
    }
    if (!required.includes('EMERGENCY_COMMS')) {
      required.push('EMERGENCY_COMMS');
      optional = optional.filter((d) => d !== 'EMERGENCY_COMMS');
    }
    if (!required.includes('CITY_ADMIN')) {
      required.push('CITY_ADMIN');
      optional = optional.filter((d) => d !== 'CITY_ADMIN');
    }
    if (incidentType === 'FIRE' && !required.includes('ELECTRICITY')) {
      required.push('ELECTRICITY'); // Power isolation required for critical structural fires
      optional = optional.filter((d) => d !== 'ELECTRICITY');
    }
  } else if (severity === 'HIGH') {
    escalationLevel = 'HIGH';
    if (matrixRule.possible.includes('HOSPITAL') && !required.includes('HOSPITAL')) {
      required.push('HOSPITAL');
      optional = optional.filter((d) => d !== 'HOSPITAL');
    }
  }

  // Generate specific department tasks
  const tasks = required.map((dep) => {
    let taskStr = `Execute ${dep} emergency response`;
    let eta = 300;

    switch (dep) {
      case 'EMS':
        taskStr = 'Medical triage, patient stabilization & transport';
        eta = 220;
        break;
      case 'POLICE':
        taskStr = 'Scene cordon, perimeter security & traffic diversion';
        eta = 240;
        break;
      case 'FIRE_RESCUE':
        taskStr = 'Fire suppression, extraction & hazardous containment';
        eta = 250;
        break;
      case 'TRAFFIC':
        taskStr = 'Traffic signal preemption & Green Corridor route override';
        eta = 150;
        break;
      case 'HOSPITAL':
        taskStr = 'ER trauma bay prep & ICU bed allocation';
        eta = 180;
        break;
      case 'DISASTER_MANAGEMENT':
        taskStr = 'Multi-agency shelter & evacuation coordination';
        eta = 360;
        break;
      case 'PUBLIC_WORKS':
        taskStr = 'Road obstruction clearance & structural assessment';
        eta = 400;
        break;
      case 'ELECTRICITY':
        taskStr = 'Power grid hazard isolation & line stabilization';
        eta = 300;
        break;
      case 'WATER_SEWERAGE':
        taskStr = 'Drainage pump deployment & culvert clearing';
        eta = 350;
        break;
      case 'WEATHER_ENV':
        taskStr = 'Radar storm surge tracking & gale advisories';
        eta = 60;
        break;
      case 'EMERGENCY_COMMS':
        taskStr = 'Inter-department event bus broadcast & telemetry sync';
        eta = 30;
        break;
      case 'CITY_ADMIN':
        taskStr = 'High-level executive resource authorization';
        eta = 60;
        break;
    }

    return { department: dep, task: taskStr, targetETASeconds: eta };
  });

  // Dependencies mapping
  const dependencies: Array<{ department: DepartmentId; dependsOn: DepartmentId; condition: string }> = [];
  if (required.includes('FIRE_RESCUE') && required.includes('ELECTRICITY')) {
    dependencies.push({
      department: 'FIRE_RESCUE',
      dependsOn: 'ELECTRICITY',
      condition: 'Power line isolation requested prior to high-pressure hose spraying',
    });
  }
  if (required.includes('EMS') && required.includes('HOSPITAL')) {
    dependencies.push({
      department: 'HOSPITAL',
      dependsOn: 'EMS',
      condition: 'ER preparation triggered upon EMS patient triage confirmation',
    });
  }
  if (required.includes('TRAFFIC') && required.includes('EMS')) {
    dependencies.push({
      department: 'TRAFFIC',
      dependsOn: 'EMS',
      condition: 'Green corridor synchronized with ambulance route trajectory',
    });
  }

  const reasoning = `Coordinator evaluated ${incidentType} [${severity}] (Escalation: ${escalationLevel}). Activated ${required.length} required departments (${required.join(', ')}). Left ${unnecessary.length} non-essential departments inactive to preserve city resource capacity.`;

  return {
    incidentId,
    incidentType,
    severity,
    escalationLevel,
    requiredDepartments: required,
    optionalDepartments: optional,
    departmentsNotRequired: unnecessary,
    tasks,
    dependencies,
    reasoning,
  };
}
