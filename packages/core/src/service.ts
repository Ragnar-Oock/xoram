import type {Emitter} from "mitt";
import {Application, getActiveApp, ServiceCollection} from "./application";
import {getActivePlugin} from "./plugins";

export interface ServiceNotifications {
  'before_destroy': {
    /**
     * The service that emitted the event
     */
    service: Service
  };

  [x: string|symbol]: unknown;
}

export interface Service<notifications extends ServiceNotifications = ServiceNotifications> {
  emitter: Emitter<notifications>
}
export type ServiceId = keyof ServiceCollection & symbol;

export type ServiceFactory<service extends Service> = (application: Application) => service;

/**
 * Register a service the depends on another or on the application.
 * @param id the id to register the service under, **MUST** be unique
 * @param serviceFactory a function taking in the application instance and returning a ready to use service
 * @public
 */
export function addService<id extends ServiceId>(id: id, serviceFactory: ServiceFactory<ServiceCollection[id]>): void;
/**
 * Register a self-contained service with no dependency.
 * @param id the id to register the service under, **MUST** be unique
 * @param service a ready to use service instance
 * @public
 */
export function addService<id extends ServiceId>(id: id, service: ServiceCollection[id]): void;
/**
 * @param id
 * @param serviceOrFactory
 *
 * @internal use one of the overrides
 */
export function addService(id: symbol, serviceOrFactory: Service | ServiceFactory<Service>): void {
  const plugin = getActivePlugin();

  if (!plugin) {
    if (import.meta.env.DEV) {
      console.warn(new Error("Invoked addService with no activePlugin"));
    }
    return;
  }

  plugin.hooks.on('beforeCreate', app => {
    const service = typeof serviceOrFactory === 'function' ? serviceOrFactory(app) : serviceOrFactory;

    // todo move this to app ?
    app.emitter.emit('beforeServiceAdded', app);
    // @ts-expect-error service resolution is done at runtime.
    app.services[id] = service;
    app.emitter.emit('serviceAdded', app);
  })

  plugin.hooks.on('beforeDestroy', app => {
    // todo emit remove service events
    // todo move this to app ?

    // @ts-expect-error service resolution is done at runtime.
    delete app.services[id];
  })
}

export function useService<id extends keyof ServiceCollection>(serviceId: id): ServiceCollection[id] {
  const app = getActiveApp();

  if (app === undefined) {
    throw new Error('useService used without an active zoram application') // todo do better
  }

  return app.services[serviceId];
}