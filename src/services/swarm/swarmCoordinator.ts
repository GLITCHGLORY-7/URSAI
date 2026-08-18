import { Incident, Ambulance, Police, Traffic, HospitalState, AIDecision } from '../../types/ursai';

export interface SwarmAgentState {
  agentId: string;
  agentType: 'AMBULANCE' | 'POLICE' | 'TRAFFIC' | 'HOSPITAL';
  status: string;
  location: [number, number];
  assignedIncidentId: string | null;
  etaSeconds: number | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastUpdated: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SwarmEvent {
  id: string;
  timestamp: string;
  type:
    | 'AGENT_AVAILABLE'
    | 'AGENT_DISPATCHED'
    | 'ROUTE_DELAYED'
    | 'REQUEST_SUPPORT'
    | 'RESOURCE_CONFLICT_DETECTED'
    | 'CONFLICT_RESOLVED'
    | 'RESOURCE_REASSIGNED'
    | 'GREEN_CORRIDOR_ACTIVATED'
    | 'HOSPITAL_LOAD_BALANCED';
  sourceAgentId: string;
  incidentId: string;
  description: string;
}

export interface ResourceConflict {
  id: string;
  timestamp: string;
  incidentsInvolved: string[];
  resourceType: 'AMBULANCE' | 'POLICE' | 'TRAFFIC' | 'HOSPITAL_ICU';
  conflictDescription: string;
  resolutionStrategy: 'PRIORITY_BASED' | 'ETA_OPTIMIZED' | 'LOAD_BALANCED';
  resolvedAction: string;
  status: 'DETECTED' | 'RESOLVED';
}

export interface SwarmCoordinationPlan {
  planId: string;
  timestamp: string;
  primaryIncidentId: string;
  activeIncidentsCount: number;
  assignedAmbulanceId: string;
  assignedPoliceId: string;
  selectedHospitalName: string;
  greenCorridorActive: boolean;
  swarmEfficiencyScore: number; // 0 - 100
  conflictsResolved: number;
  reasoning: string;
}

export class SwarmCoordinator {
  private static instance: SwarmCoordinator;
  private swarmEvents: SwarmEvent[] = [];
  private activeConflicts: ResourceConflict[] = [];

  public static getInstance(): SwarmCoordinator {
    if (!SwarmCoordinator.instance) {
      SwarmCoordinator.instance = new SwarmCoordinator();
    }
    return SwarmCoordinator.instance;
  }

  public recordEvent(event: Omit<SwarmEvent, 'id' | 'timestamp'>): SwarmEvent {
    const fullEvent: SwarmEvent = {
      ...event,
      id: `SWRM-EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.swarmEvents.unshift(fullEvent);
    if (this.swarmEvents.length > 100) this.swarmEvents.pop();
    return fullEvent;
  }

  public getEvents(): SwarmEvent[] {
    return this.swarmEvents;
  }

  public clearEvents(): void {
    this.swarmEvents = [];
    this.activeConflicts = [];
  }

  /**
   * Evaluates collective shared world state and creates a unified Swarm Coordination Plan
   */
  public evaluateSwarmState(
    incidents: Incident[],
    ambulance: Ambulance,
    police: Police,
    traffic: Traffic,
    hospital: HospitalState,
    aiDecision: AIDecision | null
  ): SwarmCoordinationPlan {
    const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
    const primaryIncident = activeIncidents[0] || { id: 'INC-DEMO-01', type: 'ROAD ACCIDENT', severity: 'HIGH' };

    let conflictsCount = 0;
    let reasoning = 'Agents operating in autonomous synchronized swarm state.';

    // Check for resource pressure/conflicts
    if (activeIncidents.length > 1) {
      conflictsCount += 1;
      reasoning = `Swarm Coordinator prioritizing Incident ${primaryIncident.id} (Severity ${primaryIncident.severity}) and queuing secondary unit.`;

      this.activeConflicts.push({
        id: `CONF-${Date.now()}`,
        timestamp: new Date().toISOString(),
        incidentsInvolved: activeIncidents.map((i) => i.id),
        resourceType: 'AMBULANCE',
        conflictDescription: `${activeIncidents.length} active emergency calls competing for single ambulance unit`,
        resolutionStrategy: 'PRIORITY_BASED',
        resolvedAction: `Dispatched AMB-01 to highest severity incident ${primaryIncident.id}`,
        status: 'RESOLVED',
      });
    }

    // Calculate Swarm Efficiency Score based on metrics
    let score = 92;
    if (traffic.greenCorridorActive) score += 5;
    if (hospital.selectedHospital) score += 3;
    if (conflictsCount > 0) score -= 8;
    score = Math.min(100, Math.max(50, score));

    return {
      planId: `SWARM-PLAN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      primaryIncidentId: primaryIncident.id,
      activeIncidentsCount: activeIncidents.length,
      assignedAmbulanceId: ambulance.id,
      assignedPoliceId: police.id,
      selectedHospitalName: hospital.selectedHospital?.name || 'Rajiv Gandhi General Hospital',
      greenCorridorActive: traffic.greenCorridorActive,
      swarmEfficiencyScore: score,
      conflictsResolved: conflictsCount,
      reasoning,
    };
  }
}
