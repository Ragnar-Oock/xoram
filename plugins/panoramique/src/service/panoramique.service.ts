import { defineService, type Service } from '@zoram/core';
import { createPinia, defineStore } from 'pinia';
import { type Component, computed, type ComputedRef, markRaw, reactive } from 'vue';
import type { ComponentDefinition, ComponentHarness } from './component-definition.type';

/**
 * Store a collection {@link ComponentDefinition | `ComponentDefinition`} to build dynamically structured UI in a Vue
 * application.
 *
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
	register<
		component extends Component,
		id extends string = string,
	>(harness: ComponentHarness<component, id>): ComponentDefinition<component, id>;

	/**
	 * Find a registered harness
	 * @param id
	 */
	get: <
		component extends Component = Component,
		id extends string = string
	>(id: id) => ComputedRef<ComponentDefinition<component, id> | undefined>;

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
	 * @param [slotName = 'default'] - name of the slot in the parent to add the child in, default's to the `default` slot
	 * @param [index = -1] - index, in the given slot, where the child should be inserted. Negative numbers are handled
	 *   like `array.at()`.
	 */
	addChild: (parent: string, child: string, slotName?: string, index?: number) => void;

	/**
	 * Remove a previously added child from its parent. This will not remove the child's definition from the store,
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

		function addChild(parent: string, child: string, slotName = 'default', index = -1): void {
			const parentDefinition = _definitions[parent];

			if (parentDefinition === undefined) {
				if (import.meta.env.NODE_ENV !== 'production') {
					console.warn(`🔭 Tried to assign a child (id: ${ child }) to a non-existing harness (id: ${ parent }). Skipping...`);
				}

				return;
			}

			const slot = (parentDefinition.children[slotName] ??= []);
			slot.splice(index, 0, child);
			parentDefinition.children[slotName] = slot;
		}

		function removeChild(parent: string, child: string, slotName = 'default'): void {
			const parentDefinition = _definitions[parent];

			if (!parentDefinition) {return;}

			parentDefinition.children[slotName] = parentDefinition.children[slotName]
				?.filter(registered => registered !== child);
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
			removeChild,
			remove,
		};
	},
);

export const panoramique = defineService<PanoramiqueService>(({ services }) => {

	services.vue.app.use(createPinia());

	return usePanoramiqueStore();
});