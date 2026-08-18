import { BaseDepartmentAgent } from './departmentAgentInterface';
import { eventBus } from '../coordination/eventBus';

export class CityAdministrationAgent extends BaseDepartmentAgent {
  constructor() {
    super('ADM-01', 'CITY_ADMIN', [13.0827, 80.2707], [
      'Executive Operations Oversight',
      'Resource Reallocation Approval',
      'Inter-Agency Emergency Governance',
    ]);
  }

  public authorizeEmergencyResources(incidentId: string, level: string): void {
    this.activate(incidentId, `AUTHORIZE_LEVEL_${level}`);
    this.updateStatus('WORKING', 'CITY_EXECUTIVE_OVERVIEW');

    eventBus.emit('DEPARTMENT_ACTIVATED', incidentId, 'CITY_ADMIN', {
      message: `City Command Executive Office approved resource allocation priority for incident ${incidentId}.`,
    });
  }
}

export const cityAdministrationAgent = new CityAdministrationAgent();
