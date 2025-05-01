import type { Emitter, EventType, Handler, WildcardHandler } from 'mitt';
import { getActiveApp } from '../application/active-app';
import type { Application, ServiceCollection } from '../application/application.type';
import { handleError } from '../error-handling';
import type { Service } from '../services/services.type';
import { warn } from '../warn.helper';
import { getActivePlugin } from './active-plugin';
import { beforeDestroy, created } from './plugin-hooks.type';

export type Notifications = Record<EventType, unknown>;
export type EventSource<notifications extends Notifications> = Emitter<notifications> | { emitter: Emitter<notifications> };
export type EventSourceGetter<notifications extends Notifications> = ((application: Application) => EventSource<notifications>);
export type EventTarget<notifications extends Notifications> = EventSource<notifications> | EventSourceGetter<notifications> | keyof ServiceCollection

function isMitt<notifications extends Notifications>(candidate: unknown): candidate is Emitter<notifications> {
	// @ts-expect-error  all we care about here is that a `on` method exists on candidate
	return typeof candidate?.on === 'function';
}

/**
 * Tries to convert an {@link EventTarget} as passed to {@link onEvent `onEvent`} into a usable emitter.
 * @param target the target to convert to an emitter
 * @param app the application to use as context
 */
function resolveSource<notifications extends Notifications>(
	target: EventTarget<notifications>,
	app: Application
): Emitter<notifications> {
	switch (typeof target) {
		case 'string':
		case 'symbol': {
			// service id syntax
			const source = app.services[target] as Service | undefined;
			if (!source) {
				// find a better way to deal with this
				throw new Error(`onEvent was invoked with an incorrect service id "${String(target)}".`)
			}
			return source.emitter as unknown as Emitter<notifications>;
		}
		case 'function': {
			// target getter syntax
			const eventSource = target(app);
			return isMitt<notifications>(eventSource)
				? eventSource
				: eventSource.emitter;
		}
		case 'object': {
			// direct target syntax
			return isMitt<notifications>(target)
				? target
				: target.emitter;
		}

		default: {
			throw new TypeError(`incorrect target provided to onEvent, typeof target === ${typeof target}, expected string, symbol, function or object`);
		}
	}
}

type UnionToIntersection<U> =
// oxlint-disable-next-line no-explicit-any
	(U extends any ? (x: U)=>void : never) extends ((x: infer I)=>void) ? I : never

export type MergedEvents<
	notifications extends Notifications,
	events extends (keyof notifications)[],
> = UnionToIntersection<notifications[events[number]]>

export type EventCleanup = () => void;

const onEventOutsidePlugin = 'onEvent was invoked outside of a plugin setup function or hook.';

/**
 * Listen to multiple events the same source at once and cleanly stop to listen when the plugin is disposed off.
 *
 * @example
 * // target getter
 * onEvent(app => app.services.myService, ['an-event', 'another-event'], console.log);
 * onEvent(({services}) => services.myService, ['an-event', 'another-event'], console.log);
 * // direct target
 * onEvent(myCustomEmitter, ['an-event', 'another-event'], console.log);
 * // service id
 * onEvent('myService', ['an-event', 'another-event'], console.log);
 *
 * @param target something to listen events on
 * @param on a list of events to listen to
 * @param handler callback to invoke when any of the events in `on` is emitted by `target`
 *
 * @public
 */
export function onEvent<
	notifications extends Notifications,
	events extends (keyof notifications)[],
>(
	target: EventTarget<notifications>,
	on: events,
	handler: Handler<MergedEvents<notifications, events>>,
): EventCleanup;

/**
 * Listen to all the events of a source at once and cleanly stop to listen when the plugin is disposed off.
 *
 * Only use this overload when you need to listen to all the events, if you need to listen to just a subset of the
 * events consider passing an array of those events.
 *
 * @example
 * // target getter
 * onEvent(app => app.services.myService, '*', console.log);
 * onEvent(({services}) => services.myService, '*', console.log);
 * // direct target
 * onEvent(myCustomEmitter, '*', console.log);
 * // service id
 * onEvent('myService', '*', console.log);
 *
 * @param target something to listen events on
 * @param on ask to subscribe to everything
 * @param handler callback to invoke when any event is emitted by `target`
 *
 * @public
 */
export function onEvent<
	notifications extends Notifications,
>(
	target: EventTarget<notifications>,
	on: '*',
	handler: WildcardHandler<notifications>
): EventCleanup;

/**
 * Listen to a specific event of a source and cleanly stop to listen when the plugin is disposed of.
 *
 * @example
 * // target getter
 * onEvent(app => app.services.myService, 'an-event', console.log);
 * onEvent(({services}) => services.myService, 'an-event', console.log);
 * // direct target
 * onEvent(myCustomEmitter, 'an-event', console.log);
 * // service id
 * onEvent('myService', 'an-event', console.log);
 *
 * @param target target something to listen events on
 * @param on the name of the event to listen to
 * @param handler callback to invoke when the event is emitted by `target`
 *
 * @public
 */
export function onEvent<
	notifications extends Notifications,
	event extends keyof notifications,
>(
	target: EventTarget<notifications>,
	on: event,
	handler: Handler<notifications[event]>
): EventCleanup;

/**
 * Use one of the overrides
 *
 * Listen to event only for the lifetime of the plugin
 * @param target the thing to listen for events on
 * @param on the events to listen for
 * @param handler the function to invoke when the event occurs
 * @internal
 */
export function onEvent<notifications extends Notifications>(target: EventTarget<notifications>, on: string|string[], handler: (...args: never[]) => void): EventCleanup {
	const plugin = getActivePlugin(),
		events = (Array.isArray(on) ? on : [on]);
	let safeHandler: (...args: never[]) => void,
		off = () => {};
	if (!plugin) {
		if (import.meta.env.DEV) {
			warn(new Error(onEventOutsidePlugin));
		}
		return off;
	}



	/**
	 * @param app the application to use as context
	 * @returns a clean up function to remove the added listeners
	 */
	const subscribe = (app: Application): void => {
		const resolvedTarget = resolveSource(target, app);
		safeHandler = (...args: never[]) => {
			try {
				handler(...args);
			}
			catch (error) {
				handleError(error, plugin, app, 'onEvent')
			}
		}

		// @ts-expect-error event and handler 's type are resolved by the function overloads above
		events.forEach(event => resolvedTarget.on(event, safeHandler));

		off = () => {
			// @ts-expect-error event and handler 's type are resolved by the function overloads above
			events.forEach(event => resolvedTarget.off(event, safeHandler))
		}
	};

	if (plugin.phase === 'setup') {
		plugin.hooks.on(created, subscribe)
	}
	else {
		const app = getActiveApp();
		if (!app) {
			if (import.meta.env.DEV) {
				warn(new Error(onEventOutsidePlugin));
			}

			return off;
		}

		subscribe(app);
	}

	plugin.hooks.on(beforeDestroy, () => {
		off();
	})

	return off;
}