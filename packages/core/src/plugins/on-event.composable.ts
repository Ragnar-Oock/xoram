import type { Emitter, EventType, Handler, WildcardHandler } from 'mitt';
import { getActiveApp } from '../application/active-app';
import type { Application } from '../application/application.type';
import type { Service, ServiceId } from '../services/services.type';
import { warn } from '../warn.helper';
import { getActivePlugin } from './active-plugin';
import type { OneOrMore } from './array.helper';
import { toArray } from './array.helper';
import { beforeDestroy, created } from './plugin-hooks.type';

/**
 * @public
 */
export type Notifications = Record<EventType, unknown>;
/**
 * An object holding an emitter, usually an application instance or service instance
 *
 * @public
 */
export type EventSourceContainer<notifications extends Notifications> = { emitter: Emitter<notifications> };
/**
 * A direct emitter.
 *
 * @public
 */
export type EventSource<notifications extends Notifications> = Emitter<notifications>;
/**
 * A function returning a direct emitter or an object holding an emitter. The application passed as parameter is the
 * current application context `onEvent` is called as part of.
 *
 * @public
 */
export type EventSourceGetter<notifications extends Notifications> = ((application: Application) => (EventSource<notifications> | EventSourceContainer<notifications>));

/**
 * @public
 */
export type EventTarget<notifications extends Notifications> =
	EventSource<notifications>
	| EventSourceContainer<notifications>
	| EventSourceGetter<notifications>
	| ServiceId

function isMitt<notifications extends Notifications>(candidate: unknown): candidate is Emitter<notifications> {
	// @ts-expect-error  all we care about here is that a `on` method exists on candidate
	return typeof candidate?.on === 'function';
}

// null object emitter as used by onEvent
const nullEmitter = <notifications extends Notifications>() => ({
	on: () => {
	}, off: () => {
	},
} as unknown as Emitter<notifications>);

/**
 * Tries to convert an {@link EventTarget} as passed to {@link onEvent `onEvent`} into a usable emitter.
 * @param target - the target to convert to an emitter
 * @param app - the application to use as context
 */
function resolveSource<notifications extends Notifications>(
	target: EventTarget<notifications>,
	app: Application,
): Emitter<notifications> {
	let source;
	switch (typeof target) {
		case 'string':
		case 'symbol': {
			// service id syntax
			source = app.services[target] as Service | undefined;

			if (source) {
				return source?.emitter as unknown as Emitter<notifications>;
			}
			else {
				if (import.meta.env.DEV) {
					warn(new Error(`onEvent was invoked with an incorrect service id "${ String(target) }".`));
				}
				return nullEmitter();
			}
		}
		case 'function': {
			// target getter syntax
			source = target(app);
			return isMitt<notifications>(source)
				? source
				: source.emitter;
		}
		case 'object': {
			if (target === null) {
				if (import.meta.env.DEV) {
					warn(new TypeError(`incorrect target provided to onEvent, typeof target === null, expected string, symbol, function or object`));
				}
				return nullEmitter();
			}
			// direct target syntax
			return isMitt<notifications>(target)
				? target
				: target.emitter;
		}

		default: {
			if (import.meta.env.DEV) {
				warn(new TypeError(`incorrect target provided to onEvent, typeof target === ${ typeof target }, expected string, symbol, function or object`));
			}
			return nullEmitter();
		}
	}
}

/**
 * @public
 */
export type UnionToIntersection<U> =
// oxlint-disable-next-line no-explicit-any
	(U extends any ? (x: U) => void : never) extends ((x: infer I) => void) ? I : never

/**
 * @public
 */
export type MergedEvents<
	notifications extends Notifications,
	events extends (keyof notifications)[],
> = UnionToIntersection<notifications[events[number]]>

/**
 * An idempotent cleanup function returned by `onEvent`. It allows you to remove any listener setup by the `onEvent`
 * call before the plugin's teardown phase.
 * @public
 */
export type EventCleanup = () => void;

const onEventOutsidePlugin = 'onEvent was invoked outside of a plugin setup function or hook.';

/**
 * Listen to multiple events from the same source at once and cleanly stop to listen when the plugin is disposed off.
 *
 * @example
 * ```ts
 * // target getter
 * onEvent(app => app.services.myService, ['an-event', 'another-event'], console.log);
 * onEvent(({services}) => services.myService, ['an-event', 'another-event'], console.log);
 * // direct target
 * onEvent(myCustomEmitter, ['an-event', 'another-event'], console.log);
 * // service id
 * onEvent('myService', ['an-event', 'another-event'], console.log);
 * ```
 *
 * @param target - something to listen events on
 * @param on - a list of events to listen to
 * @param handler - callback to invoke when any of the events in `on` is emitted by `target`
 *
 * @public
 *
 * {@label ON_MULTIPLE_EVENT}
 *
 * @see https://zoram.dev/guide/concepts-in-depth/listening-to-events#listening-to-a-set-of-events
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
 * ```ts
 * // target getter
 * onEvent(app => app.services.myService, '*', console.log);
 * onEvent(({services}) => services.myService, '*', console.log);
 * // direct target
 * onEvent(myCustomEmitter, '*', console.log);
 * // service id
 * onEvent('myService', '*', console.log);
 * ```
 *
 * @param target - something to listen events on
 * @param on - ask to subscribe to everything
 * @param handler - callback to invoke when any event is emitted by `target`
 *
 * @public
 *
 * {@label ON_ANY_EVENT}
 *
 * @see https://zoram.dev/guide/concepts-in-depth/listening-to-events#listening-to-all-events
 */
export function onEvent<
	notifications extends Notifications,
>(
	target: EventTarget<notifications>,
	on: '*',
	handler: WildcardHandler<notifications>,
): EventCleanup;

/**
 * Listen to a specific event of a source and cleanly stop to listen when the plugin is disposed of.
 *
 * @example
 * ```ts
 * // target getter
 * onEvent(app => app.services.myService, 'an-event', console.log);
 * onEvent(({services}) => services.myService, 'an-event', console.log);
 * // direct target
 * onEvent(myCustomEmitter, 'an-event', console.log);
 * // service id
 * onEvent('myService', 'an-event', console.log);
 * ```
 *
 * @param target - target something to listen events on
 * @param on - the name of the event to listen to
 * @param handler - callback to invoke when the event is emitted by `target`
 *
 * @public
 *
 * {@label ON_SINGLE_EVENT}
 *
 * @see https://zoram.dev/guide/concepts-in-depth/listening-to-events
 */
export function onEvent<
	notifications extends Notifications,
	event extends keyof notifications,
>(
	target: EventTarget<notifications>,
	on: event,
	handler: Handler<notifications[event]>,
): EventCleanup;

/**
 * Use one of the overrides
 *
 * Listen to event only for the lifetime of the plugin
 * @param target - the thing to listen for events on
 * @param on - the events to listen for
 * @param handler - the function to invoke when the event occurs
 * @internal
 */
export function onEvent<notifications extends Notifications>(
	target: EventTarget<notifications>,
	on: OneOrMore<string>,
	handler: (...args: never[]) => void,
): EventCleanup {
	const plugin = getActivePlugin(),
		events = toArray(on);
	let off = () => {
	};
	if (!plugin) {
		if (import.meta.env.DEV) {
			warn(new Error(onEventOutsidePlugin));
		}
		return off;
	}


	/**
	 * @param app - the application to use as context
	 * @returns a clean up function to remove the added listeners
	 */
	const subscribe = (app: Application): void => {
		const resolvedTarget = resolveSource(target, app);

		// @ts-expect-error event and handler 's type are resolved by the function overloads above
		events.forEach(event => resolvedTarget.on(event, handler));

		off = () => {
			// @ts-expect-error event and handler 's type are resolved by the function overloads above
			events.forEach(event => resolvedTarget.off(event, handler));
		};
	};

	switch (plugin.phase) {
		case 'setup':
		case 'mount':
			plugin.hooks.on(created, subscribe);
			break;
		case 'active':
			const app = getActiveApp();
			if (!app) {
				if (import.meta.env.DEV) {
					warn(new Error(onEventOutsidePlugin));
				}

				return () => off();
			}

			subscribe(app);
			break;
		default:
			if (import.meta.env.DEV) {
				warn(new Error(`Calling onEvent() during the ${ plugin.phase } phase of a plugin is a noop, did you use the wrong hook ?`));
			}
	}

	plugin.hooks.on(beforeDestroy, () => {
		off();
	});

	return () => off();
}

// TODO : log a warning when passing 0 event name with the multi event overload
// TODO : see if an optional parameter would be treeshaken if unused and add an option to ignore this warning if so
// TODO : log a warning when passing a single event name with the multi event overload