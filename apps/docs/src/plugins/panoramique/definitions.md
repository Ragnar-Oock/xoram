# Component Definitions

Under the hood Panoramique uses [Pinia](https://pinia.vuejs.org/) to store the
representation of how a Vue component should be mounted to the DOM, those
representations are called harnesses.

To register a harness in Panoramique you first need to create a
`ComponentDefinition`, which looks a lot like a harness but has a much more
permissive interface. The full type look like this (the actual type is much more
detailed to give you a better experience) :

```ts
export type ComponentDefinition = {
	/**
	 * Identifies the resulting harness in the store so it can be used as
	 * another one's child
	 */
	id: string;
	/**
	 * The Vue component to use when mounting the harness
	 */
	type: Component;
	/**
	 * The props to pass to the Vue component when mounting it in the application
	 */
	props?: Record<string, any>;
	/**
	 * The listeners to bind to the component when mounting it in the application
	 */
	events?: Record<string, ((...args: unknown[]) => void)[]>;
	/**
	 * The id of the other harnesses to mount as the component's children
	 * in its slots
	 */
	children?: string[] | Record<string, string[]>;
}
```

## Definition properties

### `id`

The unique string identifying the harness in the pinia store, unlike plugins
it's not using a `symbol` because the pinia dev tools don't show properties
registered with a `symbol` and it's nice to be able to see the harness you
registered.

Makes sure you use a unique string value for this field as duplicated entries
will be ignored and a warning will be printed to the console for any subsequent
registration attempt with a pre-existing id.

### `type`

The vue component that needs to be mounted, you can use any Vue component
(Setup API, Option API, Functional, yours or from a library).

### `props`

An object whose keys are the props declared by the component or attributes to
bind on the root of the component and the values are the values to assign them.

::: info

You can learn more about attribute binding on component on
the [VueJS doc](https://vuejs.org/guide/components/attrs.html)

:::

### `events`

An object whose keys are component emitted events or native events and the
values are the handlers that should be called when each event happens.

### `children`

A list of `id` pointing to other harnesses registered in Panoramique to be
mounted in the component's `default` slot or an object whole keys are slot names
and values are a list of `id` of other harnesses.

## Writing definitions

While you can write component definitions by hand (option API style) it is more
comfortable to use the setup API style offered by the
`defineComponentDefinition` helper (yes the name is stupid, feel free to suggest
a better one).

`defineComponentDefinition` takes an id, a vue component and an optional setup
function and return a fully formed definition you can register. It makes it
easier to group property, event listeners and children binding by context
instead of by type.

Because of technical limitations composable helpers used to add props, event
listeners and children are not exposed at the plugin level like it is the case
of, for example, plugin life cycle helper, but they are provided to the setup
function as a context object passed as the one and only argument.

### Setting props with `bind`

The `bind` helper allows you to set the value a component prop will be set to
when the component is mounted, it can also be used to
set [modifiers](https://vuejs.org/guide/essentials/forms.html#modifiers) if the
prop you are targeting is a model.

```ts
const email = ref('');

defineComponentDefinition(
	'email-promt',
	NewsletterSubscriptionModal,
	({ bind }) => {
		// giving a direct value
		bind('label', 'The email address to subscribe with');
		// using a ref and passing modifiers
		bind('email', email, 'sync');
	}
);
```