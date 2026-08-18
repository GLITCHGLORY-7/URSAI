import { BaseDepartmentAgent } from './departmentAgentInterface';
import { fetchRoute } from '../services/routingService';
import { eventBus } from '../coordination/eventBus';

export class FireRescueAgent extends BaseDepartmentAgent {
  constructor() {
    super('FIRE-01', 'FIRE_RESCUE', [13.0827, 80.2707], [
      'Structural Fire Suppression',
      'Extrication & Heavy Rescue',
      'Hazardous Material Containment',
    ]);
  }

  public async dispatchToIncident(incidentId: string, destLat: number, destLng: number): Promise<void> {
    this.activate(incidentId, 'DISPATCHED_TO_FIRE_INCIDENT', [destLat, destLng]);
    eventBus.emit('DEPARTMENT_ACTIVATED', incidentId, 'FIRE_RESCUE', {
      message: 'Fire & Rescue Engine 01 dispatched to emergency scene.',
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
      this.updateStatus('RESPONDING', 'EN_ROUTE_TO_FIRE_SCENE');

      eventBus.emit('DEPARTMENT_DISPATCHED', incidentId, 'FIRE_RESCUE', {
        routeDistance: routeResult.distanceMeters,
        etaSeconds: routeResult.durationSeconds,
      });
    } catch (err) {
      this.updateStatus('DEGRADED', 'ROUTING_FALLBACK_ACTIVE');
    }
  }

  public arriveAtScene(): void {
    this.updateStatus('ON_SCENE', 'SUPPRESSION_OPERATIONS_ACTIVE');
    eventBus.emit('DEPARTMENT_ARRIVED', this.state.assignedIncident || '', 'FIRE_RESCUE', {
      message: 'Fire Engine on scene. Deploying water pressure and containment gear.',
    });
  }
}

export const fireRescueAgent = new FireRescueAgent();
