import { BaseDepartmentAgent } from './departmentAgentInterface';
import { eventBus } from '../coordination/eventBus';

export class DisasterManagementAgent extends BaseDepartmentAgent {
  constructor() {
    super('DMA-01', 'DISASTER_MANAGEMENT', [13.0827, 80.2707], [
      'Multi-Agency Emergency Escalation',
      'Shelter & Evacuation Operations',
      'Citywide Resource Reallocation',
    ]);
  }

  public activateDisasterProtocol(incidentId: string, level: string): void {
    this.activate(incidentId, `DISASTER_PROTOCOL_${level}`);
    this.updateStatus('WORKING', `ESCALATED_${level}`);

    eventBus.emit('DEPARTMENT_ESCALATED', incidentId, 'DISASTER_MANAGEMENT', {
      message: `Disaster Management Protocol Activated at Level [${level}]. Coordinating city emergency shelters and evacuation corridors.`,
    });
  }
}

export const disasterManagementAgent = new DisasterManagementAgent();
