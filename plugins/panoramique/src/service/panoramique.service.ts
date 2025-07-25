import { _warn, defineService, onBeforeDestroy } from '@xoram/core';
import { createPinia, defineStore, disposePinia, type Pinia } from 'pinia';
import { type Component, computed, type ComputedRef, markRaw, reactive } from 'vue';
import type { ComponentDefinition, ComponentHarness } from './component-definition.type';
import type { StoreAsService } from './pinia-compat';

/**
 * The identifier of the harness mounted as the application root.
 *
 * @public
 */
export const rootHarness = 'root';

/**
 * Store a collection {@link ComponentHarness | `ComponentHarness`} to build dynamically structured UI in a Vue
 * application.
 *
 * @public
 */
export interface PanoramiqueStore {
	/**
	 * Register a new harness in the store for use somewhere else in the application.
	 *
	 * @param definition - a description of the harness to be added
	 *
	 * @returns the reactive harness you can interact with
	 */
	register<
		component extends Component,
		id extends string = string,
	>(definition: ComponentDefinition<component, id>): ComponentHarness<component, id>;

	/**
	 * Find a registered harness
	 * @param id - identifier of the harness to get from the store
	 */
	get: <
		component extends Component = Component,
		id extends string = string
	>(id: id) => ComputedRef<ComponentHarness<component, id> | undefined>;

	/**
	 * Safely removes a harness from the store.
	 *
	 * @param id - id of the harness to remove
	 */
	remove: (id: string) => void;

	/**
	 * Safely add a child to a registered harness. Will safely abort if the parent hasn't been registered yet.
	 *
	 * @param parent - id of the harness to add the child to
	 * @param child - id of the child
	 * @param slotName - name of the slot in the parent to add the child in, default's to the `default` slot
	 * @param index - index, in the given slot, where the child should be inserted. Negative numbers are handled
	 *   like `array.at()`. Defaults to the end of the children array if left empty.
	 */
	addChild: (parent: string, child: string, slotName?: string, index?: number) => void;

	/**
	 * Remove a previously added child from its parent. This will not remove the child's harness from the store,
	 * simply sever the link between the two components.
	 *
	 * @param parent - id of the parent the child is currently attached to
	 * @param child - if of the child to remove
	 * @param slotName - name of the slot the child is registered into, default's to the `default` slot
	 */
	removeChild: (parent: string, child: string, slotName?: string) => void;
}

/**
 * Use the `default` slot when inserting children implicitly.
 */
export const defaultSlotName = 'default';
/**
 * Insert children at the end of the existing child list of a particular slot when index is left out.
 */
export const defaultInsertionIndex = -1;
/**
 * Pinia store composable of the panoramique service. Can be used in Vue components or composable to interact with
 * harnesses.
 */
export const usePanoramiqueStore = defineStore<'panoramique', PanoramiqueStore>(
	'panoramique',
	() => {
		const _harnesses = reactive<Record<string, ComponentHarness>>({});

		function register<
			component extends Component,
			id extends string = string,
		>(
			definition: ComponentDefinition<component, id>,
		): ComponentHarness<component, id> {
			const { id, type, props = {}, events = {}, children = { default: [] } } = definition;
			if (_harnesses[id]) {
				if (import.meta.env.DEV) {
					console.warn(`🔭 A harness with the id ${ id } is already registered in the store. Skipping...`);
				}

				// return the already registered harness instead of the new one
				return _harnesses[id] as ComponentHarness<component, id>;
			}

			// using markRaw to prevents the component from being made reactive to avoid performance issues (and a deserved
			// warning from Vue)
			_harnesses[id] = {
				id,
				type: markRaw(type),
				props,
				events,
				children: Array.isArray(children) ? { default: children } : children,
			};

			return _harnesses[id] as ComponentHarness<component, id>;
		}

		function get<
			component extends Component = Component,
			id extends string = string
		>(id: id): ComputedRef<ComponentHarness<component, id> | undefined> {
			return computed(() => (_harnesses[id] as ComponentHarness<component, id> | undefined));
		}

		function addChild(parent: string, child: string, slotName = defaultSlotName, index = defaultInsertionIndex): void {
			const parentHarness = _harnesses[parent];

			if (parentHarness === undefined) {
				if (import.meta.env.DEV) {
					console.warn(`🔭 Tried to assign a child (id: ${ child }) to a non-existing harness (id: ${ parent }). Skipping...`);
				}

				return;
			}

			if (index !== undefined && !Number.isInteger(index)) {
				if (import.meta.env.DEV) {
					_warn(new Error(`addChild() index parameter must be an integer, received ${ index.toString(10) }, rounding to nearest integer.`));
				}
				index = Math.round(index);
			}

			const slot = (parentHarness.children[slotName] ??= []);
			slot.splice(index < 0 ? slot.length + index + 1 : index, 0, child);
			parentHarness.children[slotName] = slot;
		}

		function removeChild(parent: string, child: string, slotName = defaultSlotName): void {
			const parentHarness = _harnesses[parent];

			if (!parentHarness) {return;}

			parentHarness.children[slotName] = parentHarness.children[slotName]
				?.filter(registered => registered !== child);
		}

		function remove(id: string): void {
			delete _harnesses[id];
		}

		// this element is the one every other mounted in the app will descent from, it is implemented by
		// panoramique-root.vue but its type isn't used and importing it would lead to a circular import
		register({
			id: rootHarness,
			type: {} as unknown as Component,
		});

		return {
			_harnesses,

			register,
			get,
			addChild,
			removeChild,
			remove,
		};
	},
);

export const panoramique = defineService<Record<string, unknown>, StoreAsService<PanoramiqueStore>>(({ services }) => {
	const pinia: Pinia = createPinia()
		.use(({ store }) => {
			// Add the emitter key to pinia stores to allow defineService to inject the emitter when registering the store as
			// a service
			// don't use the return syntax to avoid having the emitter in the devtools
			store.emitter = {};
		});
	services.vue.app.use(pinia);

	onBeforeDestroy(() => {
		disposePinia(pinia);
	});

	return usePanoramiqueStore();
});