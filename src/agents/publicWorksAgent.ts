import { BaseDepartmentAgent } from './departmentAgentInterface';
import { fetchRoute } from '../services/routingService';
import { eventBus } from '../coordination/eventBus';

export class PublicWorksAgent extends BaseDepartmentAgent {
  constructor() {
    super('PW-01', 'PUBLIC_WORKS', [13.0382, 80.2158], [
      'Debris & Obstruction Clearance',
      'Structural Repair',
      'Heavy Equipment Operation',
    ]);
  }

  public async dispatchToIncident(incidentId: string, destLat: number, destLng: number): Promise<void> {
    this.activate(incidentId, 'DISPATCHED_ROAD_CLEARANCE', [destLat, destLng]);
    eventBus.emit('DEPARTMENT_ACTIVATED', incidentId, 'PUBLIC_WORKS', {
      message: 'Public Works Response Vehicle PW-01 activated for road clearance.',
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
      this.updateStatus('RESPONDING', 'EN_ROUTE_TO_OBSTRUCTION');

      eventBus.emit('DEPARTMENT_DISPATCHED', incidentId, 'PUBLIC_WORKS', {
        routeDistance: routeResult.distanceMeters,
        etaSeconds: routeResult.durationSeconds,
      });
    } catch {
      this.updateStatus('DEGRADED', 'ROUTING_FALLBACK_ACTIVE');
    }
  }

  public arriveAndClear(): void {
    this.updateStatus('WORKING', 'ROAD_OBSTRUCTION_REMOVAL');
    eventBus.emit('DEPARTMENT_ARRIVED', this.state.assignedIncident || '', 'PUBLIC_WORKS', {
      message: 'Public Works team on site. Debris removal and roadway restoration in progress.',
    });
  }
}

export const publicWorksAgent = new PublicWorksAgent();
