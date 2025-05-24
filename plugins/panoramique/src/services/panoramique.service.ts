import { defineService, type Service } from '@zoram/core';
import { createPinia, defineStore } from 'pinia';
import { type Component, type ComponentPublicInstance, computed, type ComputedRef, markRaw, reactive } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';

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
 */
export type HarnessChildren<component extends Component> = component extends (new (...args: unknown[]) => ComponentPublicInstance)
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

export type ComponentDefinition<component extends Component = Component, id extends string = string> = {
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
};

/**
 * @public
 */
export interface PanoramiqueService extends Service {
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
	>(id: id) => ComputedRef<ComponentDefinition<component, id> | undefined>;

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
	 */
	remove: (id: string) => void;
}

export const usePanoramiqueStore = defineStore<'panoramique', Omit<PanoramiqueService, keyof Service>>(
	'panoramique',
	() => {
		const _definitions = reactive<Record<string, ComponentDefinition>>({});

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

				// return the already registered harness instead of the new one
				return _definitions[id] as ComponentDefinition<component, id>;
			}

			_definitions[id] = {
				id,
				// prevents the component from being made reactive to avoid performance issues (and a deserved warning from Vue)
				type: markRaw(type),
				props,
				events,
				children: Array.isArray(children) ? { default: children } : children,
			};

			return _definitions[id] as ComponentDefinition<component, id>;
		}

		function get<
			component extends Component = Component,
			id extends string = string
		>(id: id): ComputedRef<ComponentDefinition<component, id> | undefined> {
			return computed(() => (_definitions[id] as ComponentDefinition<component, id> | undefined));
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

		function remove(id: string): void {
			delete _definitions[id];
		}

		register({
			id: 'root',
			type: {} as unknown as Component,
		});

		return {
			_definitions,

			register,
			get,
			addChild,
			remove,
		};
	},
);

export const panoramique = defineService<PanoramiqueService>((app) => {

	app.services.vue.app.use(createPinia());

	return usePanoramiqueStore();
});