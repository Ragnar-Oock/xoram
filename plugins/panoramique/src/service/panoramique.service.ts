import { defineService, onBeforeDestroy, type Service } from '@zoram/core';
import { createPinia, defineStore, disposePinia, type Pinia } from 'pinia';
import { type Component, computed, type ComputedRef, markRaw, reactive } from 'vue';
import type { ComponentDefinition, ComponentHarness } from './component-definition.type';

/**
 * Store a collection {@link ComponentHarness | `ComponentHarness`} to build dynamically structured UI in a Vue
 * application.
 *
 * @public
 */
export interface PanoramiqueService extends Service {
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
	 * @param [slotName = 'default'] - name of the slot the child is registered into, default's to the `default` slot
	 */
	removeChild: (parent: string, child: string, slotName?: string) => void;
}

export const usePanoramiqueStore = defineStore<'panoramique', Omit<PanoramiqueService, keyof Service>>(
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
				if (import.meta.env.NODE_ENV !== 'production') {
					console.warn(`🔭 A harness with the id ${ id } is already registered in the store. Skipping...`);
				}

				// return the already registered harness instead of the new one
				return _harnesses[id] as ComponentHarness<component, id>;
			}

			_harnesses[id] = {
				id,
				// prevents the component from being made reactive to avoid performance issues (and a deserved warning from Vue)
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

		function addChild(parent: string, child: string, slotName = 'default', index = -1): void {
			const parentHarness = _harnesses[parent];

			if (parentHarness === undefined) {
				if (import.meta.env.NODE_ENV !== 'production') {
					console.warn(`🔭 Tried to assign a child (id: ${ child }) to a non-existing harness (id: ${ parent }). Skipping...`);
				}

				return;
			}

			const slot = (parentHarness.children[slotName] ??= []);
			slot.splice(index < 0 ? slot.length + index + 1 : index, 0, child);
			parentHarness.children[slotName] = slot;
		}

		function removeChild(parent: string, child: string, slotName = 'default'): void {
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
			id: 'root',
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

export const panoramique = defineService<PanoramiqueService>(({ services }) => {

	const pinia: Pinia = createPinia();
	services.vue.app.use(pinia);

	onBeforeDestroy(() => {
		disposePinia(pinia);
	});

	return usePanoramiqueStore();
});