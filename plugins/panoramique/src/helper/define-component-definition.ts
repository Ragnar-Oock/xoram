import { _warn } from '@xoram/core';
import type { Component, MaybeRefOrGetter } from 'vue';
import type { ComponentProps, ComponentSlots } from 'vue-component-type-helpers';
import type {
	ComponentDefinition,
	ComponentPropAndModels,
	HarnessChildren,
	HarnessListenableEvents,
} from '../service/component-definition.type';
import type { Multiplex, RemoveIndex } from '../service/helper.type';
import { defaultSlotName } from '../service/panoramique.service';

/**
 * Provide tools to describe a {@link ComponentHarness} in a composable way instead of using the option syntax.
 *
 * @public
 */
export interface ComponentDefinitionHelpers<component extends Component> {
	/**
	 * Provide a value to one of the component's prop. The value can be a direct value, a reactive one or a getter (see
	 * {@link vue#MaybeRefOrGetter}).
	 *
	 * Any value set on a non-prop will be bound on the component's root unless it is a fragment, see [Vue's guide on
	 * Fallthrough Attributes](https://vuejs.org/guide/components/attrs.html#fallthrough-attributes).
	 *
	 * @param prop - the name of the prop to set the value of
	 * @param value - the direct or reactive value or getter to bind to the prop
	 * @param modifiers - any modifier to bind on the prop if it is declared as a v-model (see [handling v-model
	 *   modifier](https://vuejs.org/guide/components/v-model.html#handling-v-model-modifiers) )
	 */
	bind: <
		prop extends keyof ComponentProps<component>
	>(
		this: void,
		prop: prop,
		value: MaybeRefOrGetter<NonNullable<ComponentProps<component>[prop]>>,
		...modifiers: string[]
	) => void;

	/**
	 * Listen for an event emitted by the component. Multiple listeners can be bound on the same event by calling this
	 * function multiple time, invocation order is not guarantied.
	 *
	 * Any handler set on a non-emit event will be bound on the component's root unless it is a fragment, see [Vue's
	 * guide on Fallthrough Attributes](https://vuejs.org/guide/components/attrs.html#fallthrough-attributes).
	 *
	 * @param event - name of the event
	 * @param handler - handler to bind to the event
	 */
	on: <
		event extends keyof HarnessListenableEvents<component>
	>(
		this: void,
		event: event,
		handler: NonNullable<HarnessListenableEvents<component>[event]>,
	) => void;

	/**
	 * Insert a child in one of the component's slots.
	 *
	 * @param childId - id of the child to add
	 * @param slotName - slot to add the child into, default's to the `default` slot
	 * @param index - index, in the given slot, where the child should be inserted. Negative numbers are handled
	 *   like `array.at()`, defaults to then end of the existing child list.
	 */
	slot: (
		this: void,
		childId: string,
		slotName?: keyof RemoveIndex<ComponentSlots<component>> & string,
		index?: number,
	) => void;
}

/**
 * @public
 */
export type DefinedComponentDefinition<component extends Component, id extends string> =
	Omit<Required<ComponentDefinition<component, id>>, 'children'>
	& { children: HarnessChildren<component> }

/**
 * Programmatically describe a {@link ComponentDefinition}
 *
 * @param id - the unique identifier of the definition to create
 * @param component - the Vue component to mount when using the harness
 * @param setup - a function to programmatically describe the props, event listeners and children of the harness
 *
 * @public
 */
export function defineComponentDefinition<id extends string, component extends Component>(
	id: id,
	component: component,
	setup?: (helpers: ComponentDefinitionHelpers<component>) => void,
): DefinedComponentDefinition<component, id> {

	const definition = {
		id,
		type: component,
		props: {} as Partial<ComponentPropAndModels<component>>,
		events: {} as Partial<Multiplex<HarnessListenableEvents<component>>>,
		children: {} as HarnessChildren<component>,
	};

	setup?.({
		bind: (prop, value, ...modifiers) => {
			// @ts-expect-error prop can't index props safely, but we don't care about safe here
			definition.props[prop] = value;
			if (modifiers.length > 0) {
				// @ts-expect-error template literal can't be used to index props
				definition.props[`${ prop }Modifiers`] = Object
					.fromEntries(modifiers.map(mod => [ mod, true ]));
			}
		},
		on: (event, handler) =>
			((definition.events as Record<string, ((...args: unknown[]) => void)[]>)[event] ??= [])
				.push(handler as (...args: unknown[]) => void),
		slot: (
			childId,
			// eslint-disable-next-line default-param-last
			slotName = defaultSlotName as keyof RemoveIndex<ComponentSlots<component>> & string,
			index,
		) => {
			if (index !== undefined && !Number.isInteger(index)) {
				if (import.meta.env.DEV) {
					_warn(new Error(`slot() index parameter must be an integer, received ${ index.toString(10) }, rounding to nearest integer.`));
				}
				index = Math.round(index);
			}

			// we don't care about precise typing here
			const children = definition.children as Record<string, string[]>;
			const slot: string[] = children[slotName] ??= [];
			children[slotName] = slot.toSpliced(index ?? slot.length, 0, childId);
		},
	});

	return definition as DefinedComponentDefinition<component, id>;
}
