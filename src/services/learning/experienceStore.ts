import { IncidentType, Severity, WeatherCondition, TrafficLevel } from '../../types/ursai';

export interface LearningExperience {
  id: string;
  timestamp: string;
  incidentType: IncidentType;
  severity: Severity;
  latitude: number;
  longitude: number;
  weatherCondition: WeatherCondition;
  trafficLevel: TrafficLevel;
  ambulanceResponseTimeSeconds: number;
  policeResponseTimeSeconds: number;
  hospitalId: string;
  hospitalName: string;
  hospitalDistanceKm: number;
  routeDistanceMeters: number;
  routeDurationSeconds: number;
  greenCorridorActive: boolean;
  replanningCount: number;
  totalMissionDurationSeconds: number;
  missionSuccess: boolean;
  failureReason?: string;
  aiEngineUsed: string;
  aiDecisionPriority: string;
  finalOutcome: string;
}

export class ExperienceStore {
  private static STORAGE_KEY = 'ursai_learning_experiences';
  private static MAX_EXPERIENCES = 500;

  public static addExperience(exp: Omit<LearningExperience, 'id' | 'timestamp'>): LearningExperience {
    const experiences = ExperienceStore.getExperiences();
    const newExp: LearningExperience = {
      ...exp,
      id: `EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };

    experiences.unshift(newExp);
    if (experiences.length > ExperienceStore.MAX_EXPERIENCES) {
      experiences.pop();
    }

    try {
      localStorage.setItem(ExperienceStore.STORAGE_KEY, JSON.stringify(experiences));
    } catch {
      // LocalStorage full fallback in memory
    }

    return newExp;
  }

  public static getExperiences(): LearningExperience[] {
    try {
      const data = localStorage.getItem(ExperienceStore.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return ExperienceStore.getSeedExperiences();
  }

  public static filterExperiences(filter: {
    incidentType?: IncidentType;
    severity?: Severity;
    successOnly?: boolean;
  }): LearningExperience[] {
    return ExperienceStore.getExperiences().filter((e) => {
      if (filter.incidentType && e.incidentType !== filter.incidentType) return false;
      if (filter.severity && e.severity !== filter.severity) return false;
      if (filter.successOnly && !e.missionSuccess) return false;
      return true;
    });
  }

  public static clearExperiences(): void {
    try {
      localStorage.removeItem(ExperienceStore.STORAGE_KEY);
    } catch {
      // Memory reset
    }
  }

  public static exportJSON(): string {
    return JSON.stringify(ExperienceStore.getExperiences(), null, 2);
  }

  public static exportCSV(): string {
    const exps = ExperienceStore.getExperiences();
    if (exps.length === 0) return '';

    const headers = [
      'id',
      'timestamp',
      'incidentType',
      'severity',
      'weatherCondition',
      'trafficLevel',
      'ambulanceResponseTimeSeconds',
      'policeResponseTimeSeconds',
      'hospitalName',
      'routeDistanceMeters',
      'greenCorridorActive',
      'missionSuccess',
    ];

    const rows = exps.map((e) => [
      e.id,
      e.timestamp,
      e.incidentType,
      e.severity,
      e.weatherCondition,
      e.trafficLevel,
      e.ambulanceResponseTimeSeconds,
      e.policeResponseTimeSeconds,
      `"${e.hospitalName}"`,
      e.routeDistanceMeters,
      e.greenCorridorActive,
      e.missionSuccess,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  private static getSeedExperiences(): LearningExperience[] {
    // Generate high quality seed historical experiences for initial analytical insights
    const seeds: LearningExperience[] = [
      {
        id: 'EXP-101',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        incidentType: 'ROAD ACCIDENT',
        severity: 'HIGH',
        latitude: 13.0604,
        longitude: 80.2496,
        weatherCondition: 'CLEAR',
        trafficLevel: 'MEDIUM',
        ambulanceResponseTimeSeconds: 220,
        policeResponseTimeSeconds: 240,
        hospitalId: 'HOSP-01',
        hospitalName: 'Rajiv Gandhi Government General Hospital',
        hospitalDistanceKm: 3.2,
        routeDistanceMeters: 3800,
        routeDurationSeconds: 220,
        greenCorridorActive: true,
        replanningCount: 0,
        totalMissionDurationSeconds: 420,
        missionSuccess: true,
        aiEngineUsed: 'NVIDIA NIM',
        aiDecisionPriority: 'HIGH',
        finalOutcome: 'Patient transported safely within green corridor wave',
      },
      {
        id: 'EXP-102',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        incidentType: 'ROAD ACCIDENT',
        severity: 'CRITICAL',
        latitude: 13.0827,
        longitude: 80.2707,
        weatherCondition: 'LIGHT_RAIN',
        trafficLevel: 'HIGH',
        ambulanceResponseTimeSeconds: 280,
        policeResponseTimeSeconds: 310,
        hospitalId: 'HOSP-02',
        hospitalName: 'Apollo Hospitals Greams Road',
        hospitalDistanceKm: 4.1,
        routeDistanceMeters: 4500,
        routeDurationSeconds: 280,
        greenCorridorActive: true,
        replanningCount: 1,
        totalMissionDurationSeconds: 510,
        missionSuccess: true,
        aiEngineUsed: 'NVIDIA NIM',
        aiDecisionPriority: 'CRITICAL',
        finalOutcome: 'Replan rerouted around congestion on Anna Salai',
      },
      {
        id: 'EXP-103',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        incidentType: 'ROAD ACCIDENT',
        severity: 'MEDIUM',
        latitude: 13.0382,
        longitude: 80.2158,
        weatherCondition: 'CLEAR',
        trafficLevel: 'LOW',
        ambulanceResponseTimeSeconds: 190,
        policeResponseTimeSeconds: 210,
        hospitalId: 'HOSP-03',
        hospitalName: 'MGM Healthcare Nelson Manickam Rd',
        hospitalDistanceKm: 2.8,
        routeDistanceMeters: 3100,
        routeDurationSeconds: 190,
        greenCorridorActive: false,
        replanningCount: 0,
        totalMissionDurationSeconds: 360,
        missionSuccess: true,
        aiEngineUsed: 'NVIDIA NIM',
        aiDecisionPriority: 'MEDIUM',
        finalOutcome: 'Standard dispatch completed without disruption',
      },
    ];
    return seeds;
  }
}
