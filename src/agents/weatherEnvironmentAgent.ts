import { BaseDepartmentAgent } from './departmentAgentInterface';
import { eventBus } from '../coordination/eventBus';

export class WeatherEnvironmentAgent extends BaseDepartmentAgent {
  constructor() {
    super('WX-01', 'WEATHER_ENV', [13.0827, 80.2707], [
      'Radar Storm Surge Forecasting',
      'Precipitation Monitoring',
      'Environmental Risk Advisories',
    ]);
  }

  public publishWeatherAlert(incidentId: string, alertType: string): void {
    this.activate(incidentId, `WEATHER_ALERT_${alertType}`);
    this.updateStatus('WORKING', 'MONITORING_DOPPLER_RADAR');

    eventBus.emit('DEPARTMENT_ACTIVATED', incidentId, 'WEATHER_ENV', {
      message: `Weather Alert Broadcast: ${alertType} detected in incident sector. Advisory disseminated to all active field units.`,
    });
  }
}

export const weatherEnvironmentAgent = new WeatherEnvironmentAgent();
