# Describing components

Panoramique lets you dynamically control the structure of your Vue application
by mounting and unmounting components at runtime, similar to manipulating DOM
elements. Instead of hardcoding component trees, you define them dynamically as
your application runs. But in order to do mount a component as the child of
another one, Panoramique needs to be made aware of both of them, this is done
using objects called *harnesses* that describe the props, event listeners and
children a component should be mounted with.

To register a harness in panoramique you will need to describe it by creating a
`ComponentDefinition`, which holds the same information but is easier to
manipulate and read. The main difference between harnesses and definitions is
that harnesses are reactive and will update the component they correspond to if
modified while definitions are static.

There is two ways of writing definitions, the object way that looks a lot like
[Vue's Option API](https://vuejs.org/guide/introduction.html#options-api)
and the functional way that looks more like
the [Composition API](https://vuejs.org/guide/introduction.html#composition-api)

A `ComponentDefinition` can be pretty simple if you don't need to pass anything
to the component you want to mount as all you would need to provide is an id and
the Vue component itself, the id is used to define parent-child relationships
like you would use the component name in another's template.

::: info

Under the hood Panoramique uses [Pinia](https://pinia.vuejs.org/) to store
harnesses, you can find them in the devtools under the `panoramique` store in
the `_harnesses` key.

:::

::: details Component used in the examples

For all examples on this page the following `NewsletterSubscriptionModal.vue`
component is used.

<<< ./snippets/NewsletterSubscriptionModal.vue [NewsletterSubscriptionModal.vue]

:::

## Option style

Component definitions are simple objects that look a lot like how component
themselves are written in Vue's Option API. The full type look like this
(the actual type is much more detailed to give you a better experience) :

```ts
export type ComponentDefinition = {
	id: string;
	type: Component;
	props?: Record<string, any>;
	events?: Record<string, ((...args: unknown[]) => void)[]>;
	children?: string[] | Record<string, string[]>;
}
```

::: info

Only the `id` and `type` properties of a definition is required, if it is all
you need you don't have to provide the other ones.

:::

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

You can have more than one listener per event to make it easier to register
event handlers from another plugin without requiring the use of a decorator
pattern. Do note that the order in which listeners are invoked for a given event
is not guarantied as listeners can be added or removed at any time.

### `children`

A list of `id` pointing to other harnesses registered in Panoramique to be
mounted in the component's `default` slot or an object whole keys are slot names
and values are a list of `id` of other harnesses.

### Example of an option style definition

<<< ./snippets/option-definition.ts

## Setup style

To avoid confusion with Vue's Composition API, and because it doesn't fit its
definition, the functional way of writing component definition is called setup.
To write definitions that way you will use the `defineComponentDefinition`
helper (yes the name is stupid, feel free to suggest a better one).

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
when the component is mounted, it is the equivalent of the
[`v-bind:`](https://vuejs.org/api/built-in-directives.html#v-bind)
directive you would use in a Vue component template. You can also specify
[modifiers](https://vuejs.org/guide/essentials/forms.html#modifiers) if the prop
you are targeting is a model.

<<< ./snippets/bind-example.ts

### Listening for events with `on`

The `on` helper allows you to listen for events emitted by a component or native
events emitted by children DOM elements, it is the equivalent of the
[`v-on:`](https://vuejs.org/api/built-in-directives.html#v-on) directive.

<<< ./snippets/on-example.ts

### Registering children with `slot`

Panoramique being inherently dynamic doesn't mean you can't statically declare
children on a definition, after all it's possible that you might need to assign
a component as child of another in the same plugin if you are defining
alternative layouts of an interface for example.

To make this easier to do you can pre-assign components as children of your
definition while you are writing it with the `slot` helper. That way they are
immediately picked up when the definition is registered into panoramique.

In case your component has more than one slot or no default slot you can
indicate the slot to add the child to as the second parameter.

And because the setup API is meant to allow you to order your code as you want
with minimal impact on its execution you can specify the index to insert the
child at, that way you don't have to choose between readable code and code that
works. Note that you can also pass negative indexes to count from the end of the
child list of a given slot.

<<< ./snippets/slot-example.ts

## Which style to choose ?

The Option style is closer to the way harnesses are stored so it might be easier
to reason about if you modify components a lot or if you prefer Vue's Option
API.

The Setup style is closer to the way plugins are defined and can be easier to
organise by context if your component have complex interfaces. It is also closer
to Vue's Composition API by design.

Both styles offer the same features and are fully capable, all that you can do
with one is possible in the other. You can even use both versions in the same
codebase if you want. There is as of writing no technical limitation to one or
the other.

## Modifying definitions

No matter which way you prefer to write your definitions remember that
definitions are not harnesses, modifying their values after registering them
will not update the component they are describing. It also means you can't use
asynchronous code in the setup function of `defineComponentDefinition`
or save a helper to a local variable to modify the definition after the face.

Updating a component is done through the harness once it is registered, we will
cover this on the next page. 