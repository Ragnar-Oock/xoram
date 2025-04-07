import {Emitter, EventType, Handler, WildcardHandler} from "mitt";
import {Application, ServiceCollection} from "../application";
import {getActivePlugin} from "../plugin";
import {makeSafeCallable} from "./error-handling";

export type Notifications = Record<EventType, unknown>;
export type EventSource<notifications extends Notifications> = Emitter<notifications> | { emitter: Emitter<notifications> };
export type EventSourceGetter<notifications extends Notifications> = ((application: Application) => EventSource<notifications>) | keyof ServiceCollection;

function isMitt<notifications extends Notifications>(candidate: unknown): candidate is Emitter<notifications> {
    return (
        candidate !== null
        && typeof candidate === 'object'
        // @ts-expect-error we're checking if stuff exists
        && candidate.all instanceof Map
        // @ts-expect-error we're checking if stuff exists
        && typeof candidate.on === 'function'
        // @ts-expect-error we're checking if stuff exists
        && typeof candidate.off === 'function'
        // @ts-expect-error we're checking if stuff exists
        && typeof candidate.emit === 'function'
    )
}

function resolveSource<notifications extends Notifications>(
    target: EventSourceGetter<notifications>,
    app: Application
): Emitter<notifications> {
    switch (typeof target) {
        case 'string':
        case 'symbol': {
            const source = app.services[target];
            if (source === undefined) {
                // find a better way to deal with this
                throw new Error(`onEvent was invoked with an incorrect service id "${target}".`)
            }
            return source.emitter as unknown as Emitter<notifications>;
        }
        case 'function': {
            const eventSource = target(app);
            return isMitt<notifications>(eventSource)
                ? eventSource
                : eventSource.emitter;
        }
        default: {
            throw new TypeError(`incorrect target provided to onEvent, typeof target === ${typeof target}, expected string, symbol or function`);
        }
    }
}

type UnionToIntersection<U> =
    (U extends any ? (x: U)=>void : never) extends ((x: infer I)=>void) ? I : never

export type MergedEvents<
    notifications extends Notifications,
    events extends (keyof notifications)[],
> = UnionToIntersection<notifications[events[number]]>

/**
 * Listen to multiple events the same source at once and cleanly stop to listen when the plugin is disposed off.
 *
 * @example
 * onEvent(app => app.services.myService, ['an-event', 'another-event'], console.log);
 * onEvent(myTopic, ['an-event', 'another-event'], console.log);
 *
 * @param target something to listen events on
 * @param on a list of events to listen to
 * @param handler callback to invoke when any of the events in `on` happens
 */
export function onEvent<
    notifications extends Notifications,
    events extends (keyof notifications)[],
>(
    target: EventSourceGetter<notifications>,
    on: events,
    handler: Handler<MergedEvents<notifications, events>>,
): void;

/**
 * Listen to all the events of a source at once and cleanly stop to listen when the plugin is disposed off.
 *
 * Only use this overload when you need to listen to all the events, if you need to listen to just a subset of the
 * events consider passing an array of those events.
 *
 * @example
 * onEvent(myService, '*', console.log);
 * onEvent(myTopic, '*', console.log);
 *
 * @param target something to listen events on
 * @param on ask to subscribe to everything
 * @param handler callback to invoke when any event is emitted by `target`
 */
export function onEvent<
    notifications extends Notifications,
>(
    target: EventSourceGetter<notifications>,
    on: '*',
    handler: WildcardHandler<notifications>
): void;

/**
 * Listen to a specific event of a source and cleanly stop to listen when the plugin is disposed of.
 *
 * @param target target something to listen events on
 * @param on the name of the event to listen to
 * @param handler callback to invoke when the event is emitted by `target`
 */
export function onEvent<
    notifications extends Notifications,
    event extends keyof notifications,
>(
    target: EventSourceGetter<notifications>,
    on: event,
    handler: Handler<notifications[event]>
): void;

/**
 * Listen to event only for the lifetime of the plugin
 * @internal use one of the overrides
 */
export function onEvent<notifications extends Notifications>(target: EventSourceGetter<notifications>, on: string|string[], handler: (...args: never[]) => void): void {
    const plugin = getActivePlugin();
    if (!plugin) {
        if (import.meta.env.DEV) {
            console.error(new Error('onEvent was invoked without an active plugin'));
        }
        return;
    }


    let safeHandler: Function;
    const events = (Array.isArray(on) ? on : [on]);

    plugin.hooks.on('created', app => {
        const resolvedTarget = resolveSource(target, app);
        safeHandler = makeSafeCallable(handler, 'onEvent', plugin, app);

        // @ts-expect-error event and handler 's type are resolved by the function overloads above
        events.forEach(event => resolvedTarget.on(event, safeHandler));
    })
    plugin.hooks.on('beforeDestroy', (app) => {
        const resolvedTarget = resolveSource(target, app);
        // @ts-expect-error event and handler 's type are resolved by the function overloads above
        events.forEach(event => resolvedTarget.off(event, safeHandler))
    })


}