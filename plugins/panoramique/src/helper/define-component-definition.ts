import type { Component, MaybeRefOrGetter } from 'vue';
import type { ComponentProps, ComponentSlots } from 'vue-component-type-helpers';
import type { ComponentDefinition, ComponentEvents } from '../services/panoramique.service';

/**
 * Provide tools to describe a {@link ComponentDefinition} in a composable way instead of using the option syntax.
 */
interface ComponentDefinitionHelpers<component extends Component> {
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
		prop extends keyof ComponentProps<component> = keyof ComponentProps<component>
	>(
		this: void,
		prop: prop,
		value: MaybeRefOrGetter<ComponentProps<component>[prop]>,
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
		event extends keyof ComponentEvents<component>
	>(
		this: void,
		event: event,
		handler: NonNullable<ComponentEvents<component>[event]>,
	) => void;

	/**
	 * Insert a child in one of the component's slots.
	 *
	 * @param childId - id of the child to add
	 * @param [slotName = 'default'] - slot to add the child into
	 * @param [index = -1] - index, in the given slot, where the child should be inserted. Negative numbers are handled
	 *   like `array.at()`.
	 */
	slot: (
		this: void,
		childId: string,
		slotName?: keyof ComponentSlots<component> & string,
		index?: number,
	) => void;
}


export function defineComponentDefinition<id extends string, component extends Component>(
	id: id,
	component: component,
	setup?: (helpers: ComponentDefinitionHelpers<component>) => void,
): ComponentDefinition<component, id> {

	const definition = {
		id,
		type: component,
		props: {},
		events: {},
		children: {},
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
			// @ts-expect-error event can't index events safely, but we don't care about safe here
			(definition.events[event] ??= [])
				.push(handler),
		slot: (
			childId,
			slotName = 'default' as keyof ComponentSlots<component> & string,
			index = -1,
		) => {
			// @ts-expect-error slotName can't index children safely, but we don't care about safe here
			(definition.children[slotName] ??= []).splice(index, 0, childId);
		},
	});

	return definition as ComponentDefinition<component, id>;
}
