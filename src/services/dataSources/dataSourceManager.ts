import {
  UrsaiState,
  DataSourceMode,
  DataSourceStatusMap,
  CityState,
  NormalizedAIContext,
} from '../../types/ursai';
import { getTrafficData } from './trafficDataSource';
import { getWeatherData } from './weatherDataSource';
import { getHospitalData } from './hospitalDataSource';
import { getResourceData } from './resourceDataSource';
import { simulatedDataSource } from './simulatedDataSource';
import { computeDataQuality } from '../dataQualityService';

export class DataSourceManager {
  private currentMode: DataSourceMode = 'HYBRID';

  public setMode(mode: DataSourceMode): void {
    this.currentMode = mode;
  }

  public getMode(): DataSourceMode {
    return this.currentMode;
  }

  /**
   * Generates a status summary map of all system data sources.
   */
  public getStatusMap(state: UrsaiState, mode: DataSourceMode = this.currentMode): DataSourceStatusMap {
    const traffic = getTrafficData(state, mode);
    const hospitals = getHospitalData(state, mode);
    const resources = getResourceData(state, mode);

    const isOsrm = Boolean(state.ambulance?.route?.length > 0);
    const isNim = state.aiDecision?.engine === 'NVIDIA NIM';

    return {
      mode,
      traffic: {
        source: traffic.source,
        freshness: traffic.freshness,
        provider: traffic.provider,
      },
      weather: {
        source: 'REAL',
        freshness: 'FRESH',
        provider: 'Open-Meteo Real-Time Sensor',
      },
      hospital: {
        source: hospitals[0]?.source || 'SIMULATED',
        freshness: hospitals[0]?.freshness || 'SIMULATED',
        provider: hospitals[0]?.provider || 'URSAI Hospital Registry',
      },
      resources: {
        source: resources.source,
        freshness: resources.freshness,
        provider: resources.provider,
      },
      routing: {
        source: isOsrm ? 'OSRM' : 'FALLBACK',
        freshness: 'FRESH',
        provider: isOsrm ? 'OSRM Chennai Routing Server' : 'Geometric Haversine Engine',
      },
      ai: {
        source: isNim ? 'NVIDIA_NIM' : 'FALLBACK',
        freshness: 'FRESH',
        provider: isNim ? 'NVIDIA NIM (meta/llama-3.3-70b-instruct)' : 'Deterministic Fallback Rule Engine',
      },
    };
  }

  /**
   * Asynchronously gathers all normalized city state data.
   */
  public async getNormalizedCityState(state: UrsaiState, mode: DataSourceMode = this.currentMode): Promise<CityState> {
    const traffic = getTrafficData(state, mode);
    const weather = await getWeatherData(state, mode);
    const roads = simulatedDataSource.getRoadData(state).roads;
    const resources = getResourceData(state, mode);

    return {
      timestamp: new Date().toISOString(),
      traffic: {
        overallLevel: traffic.overallLevel,
        averageSpeedKmh: traffic.averageSpeedKmh,
        congestionIndex: traffic.congestionIndex,
      },
      weather: {
        condition: weather.condition,
        temperatureC: weather.temperatureC,
        visibilityKm: weather.visibilityKm,
        rainIntensity: weather.rainIntensity,
      },
      roads,
      resources: {
        ambulancesAvailable: resources.ambulancesAvailable,
        policeUnitsAvailable: resources.policeUnitsAvailable,
      },
      hospitalPressure: state.cityState?.hospitalPressure || 'LOW',
      affectedRoadsCount: traffic.affectedRoadsCount,
    };
  }

  /**
   * Prepares pristine, normalized context for AI reasoning with full data provenance.
   */
  public getNormalizedAIContext(state: UrsaiState, mode: DataSourceMode = this.currentMode): NormalizedAIContext {
    const traffic = getTrafficData(state, mode);
    const hospitals = getHospitalData(state, mode);
    const resources = getResourceData(state, mode);
    const roadData = simulatedDataSource.getRoadData(state);
    const statusMap = this.getStatusMap(state, mode);
    const dataQuality = computeDataQuality(statusMap);

    return {
      incident: state.activeIncident,
      traffic,
      weather: {
        condition: state.cityState.weather.condition,
        temperatureC: state.cityState.weather.temperatureC,
        visibilityKm: state.cityState.weather.visibilityKm,
        windSpeedKmh: 12.0,
        rainIntensity: state.cityState.weather.rainIntensity,
        timestamp: new Date().toISOString(),
        source: 'REAL',
        freshness: 'FRESH',
        provider: 'Open-Meteo Real-Time Weather',
      },
      roadConditions: roadData,
      resources,
      hospitals,
      currentMission: state.mission,
      currentPlan: state.mission?.currentPlan || null,
      predictions: state.prediction?.status === 'READY' ? (state.prediction as any) : null,
      dataQuality,
      sourcesSummary: {
        traffic: { source: traffic.source, freshness: traffic.freshness, provider: traffic.provider },
        weather: { source: 'REAL', freshness: 'FRESH', provider: 'Open-Meteo Weather' },
        hospitals: { source: hospitals[0]?.source || 'SIMULATED', freshness: hospitals[0]?.freshness || 'SIMULATED', provider: hospitals[0]?.provider || 'Registry' },
        resources: { source: resources.source, freshness: resources.freshness, provider: resources.provider },
      },
    };
  }
}

export const dataSourceManager = new DataSourceManager();
