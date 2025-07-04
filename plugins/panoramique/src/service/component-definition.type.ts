import type { Prettify } from '@xoram/core';
import type { Component, ComponentPublicInstance, VNodeProps } from 'vue';
import type { ComponentEmit, ComponentProps } from 'vue-component-type-helpers';
import type { AfterFirst, First, Multiplex, NonNever, OverloadParameters, Writable } from './helper.type';

/**
 * Extract a component's declared events as a strongly typed `Record<EventName, EventHandler>`.
 *
 * @public
 */
export type ComponentEvents<
	component extends Component,
	params = OverloadParameters<ComponentEmit<component> & ((...args: unknown[]) => unknown)>
> = {
	[event in First<params> & string]?: ((...args: AfterFirst<Extract<params, [ event, ...unknown[] ]>>) => void)
};
/**
 * List native events that can be fired on any HTML Element as a strongly typed `Record<EventName, EventHandler>`.
 *
 * @public
 */
export type NativeEvents = {
	[event in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[event]) => void;
}

/**
 * List all events that can be listened for on a component.
 *
 * @public
 */
export type HarnessListenableEvents<component extends Component> =
	Prettify<ComponentEvents<component>>
	& Omit<NativeEvents, keyof ComponentEvents<component>>;

/**
 * List all props the component exposes.
 *
 * @public
 */
export type ExposedComponentProps<component extends Component> = Writable<Omit<ComponentProps<component>, keyof VNodeProps>>
/**
 * List all props the component exposes and any potential modifier list for the models it defines.
 *
 * @public
 */
export type ComponentPropAndModels<component extends Component, props = ExposedComponentProps<component>> = Prettify<
	props
	& Partial<NonNever<{
	[prop in keyof props & string as `${ prop }Modifiers`]: `onUpdate:${ prop }` extends keyof props
		? Record<string, true | undefined>
		: never
}>>>

/**
 * A precursor for a {@link ComponentHarness} used to register a component into `panoramique`.
 *
 * @public
 */
export interface ComponentDefinition<component extends Component, identifier extends string = string> {
	/**
	 * The unique string identifying the harness in the pinia store, unlike plugins it's not using a `symbol` because the
	 * pinia dev tools don't show properties registered with a `symbol`, and it's nice to be able to see the harness you
	 * registered.
	 *
	 * Makes sure you use a unique string value for this field as duplicated entries will be ignored and a warning will
	 * be printed to the console for any subsequent registration attempt with a pre-existing id.
	 */
	id: identifier;
	/**
	 * The Vue component to use when mounting the harness, you can use any Vue component (Setup API, Option API,
	 * Functional, one of yours or from a library).
	 */
	type: component;
	/**
	 * The props to pass to the Vue component when mounting it in the application.
	 */
	props?: ComponentPropAndModels<component>;
	/**
	 * The listeners to bind to the component when mounting it in the application.
	 */
	events?: Multiplex<HarnessListenableEvents<component>>;
	/**
	 * The id of the other harnesses to mount as the component's children in its slots.
	 *
	 * @example
	 * ```ts
	 * register({
	 *   id: 'named slot',
	 *   type: ExampleComponent,
	 *   children: {
	 *     slotName: ['childId'],
	 *   }
	 * });
	 * register({
	 *   id: 'default slot',
	 *   type: ExampleComponent,
	 *   children: ['childId'],
	 * });
	 * register({
	 *   id: 'mixed slot',
	 *   type: ExampleComponent,
	 *   children: {
	 *     default: ['childId'],
	 *     slotName: ['otherChildId'],
	 *   }
	 * });
	 * ```
	 */
	children?: ChildrenIds | HarnessChildren<component>;
}

/**
 * An ordered array of harness ids meant to be mounted as the children of another harness.
 *
 * @public
 */
export type ChildrenIds = string[];
/**
 * Maps the slots advertised by a component to a list of children IDs to be bound to those same slots.
 *
 * A looser openly indexed slot to children IDs record is available is the slot names can't be inferred from the
 * component's type.
 *
 * @example
 * ```ts
 * const children = {
 *   default: ['child1', 'child2'],
 *   header: ['cardHeader']
 * }
 * ```
 *
 * @public
 */
export type HarnessChildren<component extends Component> = component extends (new (...args: unknown[]) => ComponentPublicInstance)
	? {
		/**
		 * A List of child id to use as children in the component's named slots
		 */
		[key in keyof InstanceType<component>['$slots']]?: ChildrenIds
	}
	: {
		/**
		 * A List of child id to use as children in the component's named slots
		 */
		[slot: string]: ChildrenIds;
	}

/**
 * Describe how a component should be mounted into the Vue app.
 *
 * @public
 */
export interface ComponentHarness<component extends Component = Component, identifier extends string = string> {
	/**
	 * Identifies the harness in the store so it can be used as another one's child.
	 */
	id: identifier;
	/**
	 * The Vue component to use when mounting the harness
	 */
	type: component;
	/**
	 * The props to pass to the Vue component when mounting it in the application.
	 */
	props: ComponentPropAndModels<component>;
	/**
	 * The listeners to bind to the component when mounting it in the application.
	 */
	events: Multiplex<ComponentEvents<component>>;
	/**
	 * The id of the other harnesses to mount as the component's children in its slots
	 */
	children: HarnessChildren<component>;
}
