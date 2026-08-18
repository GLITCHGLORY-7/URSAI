import { BaseDepartmentAgent } from './departmentAgentInterface';
import { fetchRoute } from '../services/routingService';
import { eventBus } from '../coordination/eventBus';

export class ElectricityAgent extends BaseDepartmentAgent {
  constructor() {
    super('PWR-01', 'ELECTRICITY', [13.0604, 80.2496], [
      'Power Grid Isolation',
      'High Voltage Line Repair',
      'Substation Emergency Safety',
    ]);
  }

  public async dispatchToIncident(incidentId: string, destLat: number, destLng: number): Promise<void> {
    this.activate(incidentId, 'HAZARD_ISOLATION_DISPATCH', [destLat, destLng]);
    eventBus.emit('DEPARTMENT_ACTIVATED', incidentId, 'ELECTRICITY', {
      message: 'Power Utility Emergency Crew PWR-01 activated for grid isolation.',
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
      this.updateStatus('RESPONDING', 'EN_ROUTE_TO_POWER_HAZARD');

      eventBus.emit('DEPARTMENT_DISPATCHED', incidentId, 'ELECTRICITY', {
        routeDistance: routeResult.distanceMeters,
        etaSeconds: routeResult.durationSeconds,
      });
    } catch {
      this.updateStatus('DEGRADED', 'ROUTING_FALLBACK_ACTIVE');
    }
  }

  public isolatePowerHazard(): void {
    this.updateStatus('WORKING', 'GRID_POWER_ISOLATED');
    eventBus.emit('TASK_COMPLETED', this.state.assignedIncident || '', 'ELECTRICITY', {
      message: 'Electrical hazard isolated. Power feeder line de-energized for emergency crew safety.',
    });
  }
}

export const electricityAgent = new ElectricityAgent();
