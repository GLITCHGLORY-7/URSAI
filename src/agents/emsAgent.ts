import { BaseDepartmentAgent } from './departmentAgentInterface';
import { fetchRoute } from '../services/routingService';
import { eventBus } from '../coordination/eventBus';

export class EMSAgent extends BaseDepartmentAgent {
  constructor() {
    super('EMS-01', 'EMS', [13.0827, 80.2707], [
      'Advanced Life Support',
      'Patient Triage & Stabilization',
      'Rapid Hospital Transport',
    ]);
  }

  public async dispatchToIncident(incidentId: string, destLat: number, destLng: number): Promise<void> {
    this.activate(incidentId, 'MEDICAL_RESPONSE_DISPATCH', [destLat, destLng]);
    eventBus.emit('DEPARTMENT_ACTIVATED', incidentId, 'EMS', {
      message: 'EMS Paramedic Unit EMS-01 dispatched to emergency location.',
    });

    try {
      const routeResult = await fetchRoute(
        this.state.location[0],
        this.state.location[1],
        destLat,
        destLng
      );

      this.state.route = routeResult.coordinates;
      this.state.routeDistanceMeters = routeResult.distanceMeters;
      this.state.routeDurationSeconds = routeResult.durationSeconds;
      this.state.etaSeconds = routeResult.durationSeconds;
      this.updateStatus('RESPONDING', 'EN_ROUTE_TO_PATIENT');

      eventBus.emit('DEPARTMENT_DISPATCHED', incidentId, 'EMS', {
        routeDistance: routeResult.distanceMeters,
        etaSeconds: routeResult.durationSeconds,
      });
    } catch {
      this.updateStatus('DEGRADED', 'ROUTING_FALLBACK_ACTIVE');
    }
  }

  public arriveAtScene(): void {
    this.updateStatus('ON_SCENE', 'PATIENT_TRIAGE_ACTIVE');
    eventBus.emit('DEPARTMENT_ARRIVED', this.state.assignedIncident || '', 'EMS', {
      message: 'EMS Paramedics on scene. Initiating patient vital triage.',
    });
  }
}

export const emsAgent = new EMSAgent();
