import { DigitalTwinState } from './digitalTwinState';
import { Scenario, ScenarioParameters } from '../../types/ursai';

/**
 * Digital Twin Engine: Modifies the isolated Digital Twin state copy
 * according to scenario parameters without touching live application state.
 */
export class DigitalTwinEngine {
  public applyScenario(state: DigitalTwinState, scenario: Scenario): DigitalTwinState {
    const twinState = JSON.parse(JSON.stringify(state)) as DigitalTwinState;
    const { type, params } = scenario;

    switch (type) {
      case 'TRAFFIC_INCREASE': {
        const factor = 1 + (params.trafficIncreasePercent || 30) / 100;
        twinState.cityState.traffic.congestionIndex = Math.min(
          1.0,
          twinState.cityState.traffic.congestionIndex * factor
        );
        twinState.cityState.traffic.averageSpeedKmh = Math.max(
          10,
          twinState.cityState.traffic.averageSpeedKmh / factor
        );
        twinState.cityState.traffic.overallLevel =
          twinState.cityState.traffic.congestionIndex > 0.8
            ? 'CRITICAL'
            : twinState.cityState.traffic.congestionIndex > 0.6
            ? 'HIGH'
            : 'MEDIUM';

        // Scale route durations for ambulance and police
        if (twinState.ambulance.routeDuration) {
          twinState.ambulance.routeDuration = Math.round(twinState.ambulance.routeDuration * factor);
          if (twinState.ambulance.eta) {
            twinState.ambulance.eta = Math.round(twinState.ambulance.eta * factor);
          }
        }
        break;
      }

      case 'ROAD_BLOCKAGE': {
        const roadName = params.blockedRoadName || 'Anna Salai Main Corridor';
        twinState.cityState.roads = twinState.cityState.roads.map((road) =>
          road.name.toLowerCase().includes(roadName.toLowerCase()) || road.id === 'road-1'
            ? { ...road, blocked: true, status: 'BLOCKED', congestionIndex: 1.0 }
            : road
        );
        twinState.cityState.affectedRoadsCount = twinState.cityState.roads.filter((r) => r.blocked).length;
        break;
      }

      case 'HOSPITAL_CAPACITY_REDUCTION': {
        const reductionPct = (params.hospitalCapacityReductionPercent || 50) / 100;
        twinState.hospital.allHospitals = twinState.hospital.allHospitals.map((h) => {
          if (twinState.hospital.selectedHospital && h.id === twinState.hospital.selectedHospital.id) {
            return {
              ...h,
              icuBedsAvailable: Math.max(0, Math.floor(h.icuBedsAvailable * (1 - reductionPct))),
              bedsAvailable: Math.max(0, Math.floor(h.bedsAvailable * (1 - reductionPct))),
              emergencyReadiness: h.icuBedsAvailable * (1 - reductionPct) > 1,
            };
          }
          return h;
        });

        if (twinState.hospital.selectedHospital) {
          const updatedSelected = twinState.hospital.allHospitals.find(
            (h) => h.id === twinState.hospital.selectedHospital!.id
          );
          if (updatedSelected) {
            twinState.hospital.selectedHospital = updatedSelected;
          }
        }
        twinState.cityState.hospitalPressure = 'CRITICAL';
        break;
      }

      case 'WEATHER_DETERIORATION': {
        const severity = params.rainSeverity || 'HEAVY';
        twinState.cityState.weather = {
          condition: severity === 'TORRENTIAL' ? 'HEAVY_RAIN' : 'LIGHT_RAIN',
          temperatureC: 26,
          visibilityKm: severity === 'TORRENTIAL' ? 1.5 : 3.0,
          rainIntensity: severity === 'TORRENTIAL' ? 'HEAVY' : 'LIGHT',
        };
        // Weather friction increases ambulance ETA by 25% to 50%
        const weatherDelayFactor = severity === 'TORRENTIAL' ? 1.5 : 1.25;
        if (twinState.ambulance.eta) {
          twinState.ambulance.eta = Math.round(twinState.ambulance.eta * weatherDelayFactor);
        }
        break;
      }

      case 'AMBULANCE_DELAY': {
        const delaySeconds = (params.ambulanceDelayMinutes || 5) * 60;
        if (twinState.ambulance.eta !== null) {
          twinState.ambulance.eta += delaySeconds;
        }
        if (twinState.ambulance.routeDuration !== null) {
          twinState.ambulance.routeDuration += delaySeconds;
        }
        break;
      }

      case 'GREEN_CORRIDOR_UNAVAILABLE': {
        twinState.traffic.greenCorridorActive = false;
        twinState.traffic.status = 'RESPONDING';
        // Absence of Green Corridor adds ~35% delay due to traffic light stops
        if (twinState.ambulance.eta !== null) {
          twinState.ambulance.eta = Math.round(twinState.ambulance.eta * 1.35);
        }
        break;
      }
    }

    return twinState;
  }
}

export const digitalTwinEngine = new DigitalTwinEngine();
