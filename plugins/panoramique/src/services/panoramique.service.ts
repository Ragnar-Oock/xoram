import { defineService, type Prettify, type Service } from '@zoram/core';
import { createPinia, defineStore } from 'pinia';
import {
	type AllowedComponentProps,
	type Component,
	type ComponentPublicInstance,
	computed,
	type ComputedRef,
	markRaw,
	type Reactive,
	reactive,
	type VNodeProps,
} from 'vue';
import PanoramiquePlatform from '../components/PanoramiquePlatform.vue';

/**
 * Extracts the props a component can take as input
 */
export type ComponentProps<component extends Component> =
	component extends Component<infer props>
		? Partial<Omit<props, keyof VNodeProps> & AllowedComponentProps>
		: Record<string, never>;

// todo make this type work more reliably
export type ComponentEvents<component extends Component> =
	component extends Component<never, never, never, never, never, infer emits>
		? emits
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		: Record<string, (...args: any[]) => void>

export type ComponentHarness<component extends Component, id extends string = string> = {
	/**
	 * Identifies the harness in the store so it can be used as another one's child.
	 */
	id: id;
	/**
	 * The Vue component to use when mounting the harness
	 */
	type: component;
	/**
	 * The props to pass to the Vue component when mounting it in the application.
	 */
	props?: ComponentProps<component>;
	/**
	 * The listeners to bind to the component when mounting it in the application.
	 */
	events?: ComponentEvents<component>;
	/**
	 * The id of the other harnesses to mount as the component's children in its slots
	 */
	children?: ChildrenIds | HarnessChildren<component>;
}

export type ChildrenIds = string[];

export type HarnessChildren<component extends Component> = component extends (new (...args: any[]) => ComponentPublicInstance)
	? {
		/**
		 * A List of child id to use as children in the component's named slots
		 */
		[key in keyof InstanceType<component>['$slots']]: ChildrenIds
	}
	: {
		/**
		 * A List of child id to use as children in the component's named slots
		 */
		[slot: string]: ChildrenIds
	}

export type ComponentDefinition<component extends Component = Component, id extends string = string> = Prettify<{
	/**
	 * Identifies the harness in the store so it can be used as another one's child.
	 */
	id: id;
	/**
	 * The Vue component to use when mounting the harness
	 */
	type: component;
	/**
	 * The props to pass to the Vue component when mounting it in the application.
	 */
	props: ComponentProps<component>;
	/**
	 * The listeners to bind to the component when mounting it in the application.
	 */
	events: ComponentEvents<component>;
	/**
	 * The id of the other harnesses to mount as the component's children in its slots
	 */
	children: HarnessChildren<component>;
}>;

export interface PanoramiqueService extends Service {
	/**
	 * Store the registered harnesses.
	 *
	 * @internal only exposed for Pinia to do its magic and the devtools to work
	 */
	_definitions: Reactive<Record<string, ComponentDefinition>>;

	/**
	 * Register a new harness in the store for use somewhere else in the application.
	 *
	 * @param harness - a description of the harness to be added
	 *
	 * @returns the reactive harness you can interact with
	 */
	register: <
		component extends Component,
		id extends string = string,
	>(harness: ComponentHarness<component, id>) => ComponentDefinition<component, id>;

	/**
	 * Find a registered harness
	 * @param id
	 */
	get: <
		component extends Component = Component,
		id extends string = string
	>(id: id) => ComputedRef<ComponentDefinition<component, id> | null>;

	/**
	 * Safely add a child to a registered harness. Will safely abort if the parent hasn't been registered yet.
	 *
	 * @param parent - id of the harness to add the child to
	 * @param child - id of the child
	 */
	addChild: (parent: string, child: string) => void;

	/**
	 * Safely removes a harness from the store.
	 *
	 * @param id - id of the harness to remove
	 * @param [pruneOrphans = false] - should the harness' children not used by other harnesses be recursively removed
	 *   as well ?
	 */
	remove: (id: string, pruneOrphans?: boolean) => void;
}

export const usePanoramiqueStore = defineStore('panoramique', () => {
	const _definitions = reactive<Record<string, ComponentDefinition>>({});

	/*
	 function register<
	 component extends Component,
	 id extends string = string,
	 children extends ChildrenIds | HarnessChildren<component> = []
	 >(
	 harness: ComponentHarness<component, id, children>
	 ): ComponentDefinition<component, id, ChildrenFromHarness<component, children>>
	 */

	function register<
		component extends Component,
		id extends string = string,
	>(
		harness: ComponentHarness<component, id>,
	): ComponentDefinition<component, id> {
		const { id, type, props = {}, events = {}, children = { default: [] } } = harness;
		if (_definitions[id]) {
			if (import.meta.env.NODE_ENV !== 'production') {
				console.warn(`🔭 A harness with the id ${ id } is already registered in the store. Skipping...`);
			}

			return _definitions[id] as ComponentDefinition<component, id>; // return the already registered harness instead
		                                                                 // of the new one
		}

		_definitions[id] = {
			id,
			type: markRaw(type), // prevents the component from being made reactive to avoid performance issues (and a
		                       // deserved warning from Vue)
			props,
			events,
			children: Array.isArray(children) ? { default: children } : children,
		};

		return _definitions[id] as ComponentDefinition<component, id>;
	}

	function get<component extends Component = Component, id extends string = string>(id: id): ComputedRef<ComponentDefinition<component, id> | null> {
		return computed(() => (_definitions[id] as ComponentDefinition<component, id> | undefined) ?? null);
	}

	function addChild(parent: string, child: string, slotName = 'default'): void {
		const parentDefinition = _definitions[parent];

		if (parentDefinition === undefined) {
			if (import.meta.env.NODE_ENV !== 'production') {
				console.warn(`🔭 Tried to assign a child (id: ${ child }) to a non-existing harness (id: ${ parent }). Skipping...`);
			}

			return;
		}
		const slot = parentDefinition.children[slotName] ??= [];

		slot.push(child);
	}

	function remove(id: string, pruneOrphans = false): void {
		const harness = _definitions[id];

		if (harness === undefined) {
			return; // harness doesn't exist, nothing to do
		}

		delete _definitions[id];

		if (pruneOrphans) {
			Object
				.values(harness.children)
				.forEach(children => {
					children.forEach(child => {
						Object
							.values(_definitions)
							.forEach(({ children }) =>
								Object
									.values(children)
									.some(slotChildren => slotChildren.includes(child))
									? ''
									: remove(child, true));
					});
				});
		}
	}

	register({
		id: 'root',
		type: PanoramiquePlatform,
	});

	return {
		_definitions,

		register,
		get,
		addChild,
		remove,
	};
});

export const panoramique = defineService<PanoramiqueService>((app) => {

	app.services.vue.app.use(createPinia());

	return usePanoramiqueStore();
});