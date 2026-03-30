import { z } from 'zod';

export const TelemetryEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  eventName: z.enum([
    'project_created',
    'sketch_uploaded',
    'terrain_uploaded',
    'brief_interpreted',
    'ambiguity_detected',
    'concept_generated',
    'plan_edited',
    'render_generated',
    'video_generated',
    'version_saved',
    'export_created',
    'user_feedback_submitted'
  ]),
  projectId: z.string().uuid().optional(),
  modelUsed: z.string().optional(),
  provider: z.string().optional(),
  latencyMs: z.number().optional(),
  estimatedCostUsd: z.number().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;

// EGOS Observability Logger
export class EGOSLogger {
  private static instance: EGOSLogger;
  private events: TelemetryEvent[] = [];
  private listeners: ((events: TelemetryEvent[]) => void)[] = [];

  private constructor() {}

  public static getInstance(): EGOSLogger {
    if (!EGOSLogger.instance) {
      EGOSLogger.instance = new EGOSLogger();
    }
    return EGOSLogger.instance;
  }

  public log(event: Omit<TelemetryEvent, 'id' | 'timestamp'>) {
    const newEvent: TelemetryEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    } as TelemetryEvent;
    
    this.events.push(newEvent);
    this.notifyListeners();
    
    // In a real app, this would send to a backend (e.g., PostHog, Datadog, or custom EGOS backend)
    console.log('[EGOS Telemetry]', newEvent.eventName, newEvent);
  }

  public getEvents() {
    return this.events;
  }

  public subscribe(listener: (events: TelemetryEvent[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.events));
  }
}

export const logger = EGOSLogger.getInstance();
