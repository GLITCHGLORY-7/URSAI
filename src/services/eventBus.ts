import { logger } from './logger';

export type URSAIEventType =
  | 'DATA_SOURCE_CONNECTED'
  | 'DATA_SOURCE_UPDATED'
  | 'DATA_SOURCE_STALE'
  | 'DATA_SOURCE_FAILED'
  | 'DATA_SOURCE_RECOVERED'
  | 'DATA_FALLBACK_ACTIVATED'
  | 'DATA_VALIDATION_FAILED'
  | 'AI_CONTEXT_UPDATED'
  | 'AI_CONFIDENCE_UPDATED'
  | 'SITUATION_REPORT_UPDATED'
  | 'INCIDENT_CREATED'
  | 'MISSION_UPDATED'
  // Phase 12: Scenario Intelligence Events
  | 'SCENARIO_CREATED'
  | 'SCENARIO_STARTED'
  | 'SCENARIO_DATA_APPLIED'
  | 'SCENARIO_ROUTE_CALCULATED'
  | 'SCENARIO_EVALUATED'
  | 'SCENARIO_AI_ANALYZED'
  | 'SCENARIO_COMPLETED'
  | 'SCENARIO_FAILED'
  | 'SCENARIO_RESET'
  // Phase 13: Performance & Evaluation Events
  | 'ACCIDENT_DETECTED'
  | 'AI_DECISION_GENERATED'
  | 'MISSION_CREATED'
  | 'AMBULANCE_DISPATCHED'
  | 'AMBULANCE_ARRIVED'
  | 'POLICE_DISPATCHED'
  | 'POLICE_ARRIVED'
  | 'GREEN_CORRIDOR_ACTIVATED'
  | 'ROUTE_CREATED'
  | 'ROUTE_UPDATED'
  | 'PLAN_REVIEW_REQUIRED'
  | 'PLAN_REPLANNED'
  | 'HOSPITAL_SELECTED'
  | 'HOSPITAL_READY'
  | 'INCIDENT_RESOLVED'
  | 'MISSION_FAILED'
  | 'SYSTEM_DEGRADED'
  | 'SYSTEM_RECOVERED'
  | 'EXPERIMENT_STARTED'
  | 'EXPERIMENT_RUN_COMPLETED'
  | 'EXPERIMENT_COMPLETED';

export interface URSAIEvent<T = any> {
  id: string;
  type: URSAIEventType;
  timestamp: string;
  payload: T;
  source: string;
}

type EventListener<T = any> = (event: URSAIEvent<T>) => void;

class URSAIEventBus {
  private listeners: Map<URSAIEventType, Set<EventListener>> = new Map();
  private eventHistory: URSAIEvent[] = [];
  private maxHistorySize = 100;

  public subscribe<T = any>(eventType: URSAIEventType, listener: EventListener<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    const set = this.listeners.get(eventType)!;
    set.add(listener as EventListener);

    return () => {
      set.delete(listener as EventListener);
    };
  }

  public publish<T = any>(type: URSAIEventType, payload: T, source: string = 'SYSTEM'): URSAIEvent<T> {
    const event: URSAIEvent<T> = {
      id: `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      timestamp: new Date().toISOString(),
      payload,
      source,
    };

    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    logger.info(`[EventBus] Published ${type} from ${source}`, { eventId: event.id });

    const set = this.listeners.get(type);
    if (set) {
      set.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          logger.error(`[EventBus] Error in listener for ${type}`, err);
        }
      });
    }

    return event;
  }

  public getRecentEvents(limit: number = 20): URSAIEvent[] {
    return this.eventHistory.slice(-limit);
  }

  public clearHistory(): void {
    this.eventHistory = [];
  }
}

export const eventBus = new URSAIEventBus();
