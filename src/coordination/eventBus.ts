export interface CoordinationEvent {
  id: string;
  type: string;
  timestamp: string; // ISO string
  incidentId: string;
  source: string;
  payload?: any;
}

export type EventCallback = (event: CoordinationEvent) => void;

class EventBus {
  private listeners: EventCallback[] = [];

  subscribe(callback: EventCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  emit(type: string, incidentId: string, source: string, payload?: any): CoordinationEvent {
    const event: CoordinationEvent = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      timestamp: new Date().toISOString(),
      incidentId,
      source,
      payload,
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('[EventBus] Listener error:', err);
      }
    }

    return event;
  }
}

export const eventBus = new EventBus();
