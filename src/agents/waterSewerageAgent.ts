import { BaseDepartmentAgent } from './departmentAgentInterface';
import { fetchRoute } from '../services/routingService';
import { eventBus } from '../coordination/eventBus';

export class WaterSewerageAgent extends BaseDepartmentAgent {
  constructor() {
    super('WTR-01', 'WATER_SEWERAGE', [13.0067, 80.202], [
      'High Capacity Drainage Pumping',
      'Stormwater Canal Clearance',
      'Water Main Rupture Isolation',
    ]);
  }

  public async dispatchToIncident(incidentId: string, destLat: number, destLng: number): Promise<void> {
    this.activate(incidentId, 'DRAINAGE_PUMP_DISPATCH', [destLat, destLng]);
    eventBus.emit('DEPARTMENT_ACTIVATED', incidentId, 'WATER_SEWERAGE', {
      message: 'Water & Sewerage Board Pump Unit WTR-01 dispatched to flood zone.',
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
      this.updateStatus('RESPONDING', 'EN_ROUTE_TO_FLOOD_ZONE');

      eventBus.emit('DEPARTMENT_DISPATCHED', incidentId, 'WATER_SEWERAGE', {
        routeDistance: routeResult.distanceMeters,
        etaSeconds: routeResult.durationSeconds,
      });
    } catch {
      this.updateStatus('DEGRADED', 'ROUTING_FALLBACK_ACTIVE');
    }
  }

  public deployPumps(): void {
    this.updateStatus('WORKING', 'STORMWATER_PUMPING_ACTIVE');
    eventBus.emit('TASK_STARTED', this.state.assignedIncident || '', 'WATER_SEWERAGE', {
      message: 'Heavy drainage pumps operational. Pumping stormwater into primary outflow canal.',
    });
  }
}

export const waterSewerageAgent = new WaterSewerageAgent();
