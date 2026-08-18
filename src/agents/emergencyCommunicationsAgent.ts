import { BaseDepartmentAgent } from './departmentAgentInterface';
import { eventBus } from '../coordination/eventBus';

export class EmergencyCommunicationsAgent extends BaseDepartmentAgent {
  constructor() {
    super('COM-01', 'EMERGENCY_COMMS', [13.0827, 80.2707], [
      'Inter-Department Event Routing',
      'Telemetry Sync Validation',
      'First-Responder Radio Network Management',
    ]);
  }

  public routeCrossDepartmentMessage(fromDept: string, toDept: string, message: string, incidentId: string): void {
    this.activate(incidentId, `ROUTING_${fromDept}_TO_${toDept}`);
    this.updateStatus('WORKING', 'CROSS_DEPT_RELAY');

    eventBus.emit('DEPARTMENT_ACTIVATED', incidentId, 'EMERGENCY_COMMS', {
      from: fromDept,
      to: toDept,
      message,
    });
  }
}

export const emergencyCommunicationsAgent = new EmergencyCommunicationsAgent();
