import { defineService, type Prettify, type Service } from '@zoram/core';
import { createPinia, defineStore } from 'pinia';
import { type Component, type ComponentPublicInstance, computed, type ComputedRef, markRaw, reactive } from 'vue';
import type { ComponentEmit, ComponentProps } from 'vue-component-type-helpers';

/**
 * Utility for extracting the parameters from a function overload (for typed emits)
 * https://github.com/microsoft/TypeScript/issues/32164#issuecomment-1146737709
 */
// we need the "any" here because of how ComponentEmit is typed
// eslint-disable-next-line no-explicit-any
export type OverloadParameters<T extends (...args: any[]) => unknown> = Parameters<OverloadUnion<T>>;
type OverloadProps<TOverload> = Pick<TOverload, keyof TOverload>;
type OverloadUnionRecursive<TOverload, TPartialOverload = unknown> = TOverload extends (...args: infer TArgs) =>
		infer TReturn ? TPartialOverload extends TOverload ? never : OverloadUnionRecursive<TPartialOverload & TOverload,
		TPartialOverload & ((...args: TArgs) => TReturn) & OverloadProps<TOverload>> | ((...args: TArgs) => TReturn) :
	never;
type OverloadUnion<TOverload extends (...args: unknown[]) => unknown> = Exclude<OverloadUnionRecursive<(() => never)
	& TOverload>, TOverload extends () => never ? never : () => never>;

/**
 * Extract the first element from a tuple
 */
type First<tuple> = tuple extends [ infer first, ...unknown[] ] ? first : never;
/**
 * Extract everything but the first element of a tuple
 */
type AfterFirst<tuple> = tuple extends [ unknown, ...infer rest ] ? rest : never;

export type ComponentEvents<component extends Component> = Prettify<{
	[event in First<OverloadParameters<ComponentEmit<component>>> & string]?: (...args: AfterFirst<Extract<OverloadParameters<ComponentEmit<component>>, [ event, ...unknown[] ]>>) => void
}>

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

		// this element is the one every other mounted in the app will descent from, it is implemented by
		// panoramique-root.vue but its type isn't used and importing it would lead to a circular import
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