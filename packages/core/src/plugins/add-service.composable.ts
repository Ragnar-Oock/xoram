import {getActiveApp, serviceSymbol} from "../application.ts";
import type {Emitter} from "mitt";

interface ServiceNotifications {
  'destroy:before': {
    /**
     * The service that emitted the event
     */
    service: Service
  };

  [x: string|symbol]: unknown;
}

export interface Service<notifications extends ServiceNotifications = ServiceNotifications> {
  readonly id: string;
  emitter: Emitter<notifications>
}

export function addService(service: Service): void {
  const app = getActiveApp();

  if (!app) {
    if (import.meta.env.DEV) {
      console.warn(new Error("Invoked addService with no activeApp"));
    }
    return;
  }

  app.emitter.emit('beforeAddService', app);
  // @ts-expect-error service resolution is done at runtime.
  app[serviceSymbol][service.id] = service;
  app.emitter.emit('serviceAdded', app);
}
