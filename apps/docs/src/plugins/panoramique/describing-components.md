# Describing components

Panoramique lets you dynamically control the structure of your Vue application
by mounting and unmounting components at runtime, similar to manipulating DOM
elements. Instead of hardcoding component trees, you define them dynamically as
your application runs. But in order to do mount a component as the child of
another one, Panoramique needs to be made aware of both of them, this is done
using objects called **harnesses** that describe the props, event listeners and
children a component should be mounted with.

To register a harness in panoramique you will need to describe it by creating a
`ComponentDefinition`, which holds the same information but is easier to
manipulate and read. The main difference between harnesses and definitions is
that definitions are static while harnesses are reactive and will update the
corresponding component when modified.

There is two ways of writing definitions, the object way that looks a lot like
[Vue's Option API](https://vuejs.org/guide/introduction.html#options-api)
and the functional way that looks more like
the [Composition API](https://vuejs.org/guide/introduction.html#composition-api)

::: details Component used in the examples

For all examples on this page the following `NewsletterSubscriptionModal.vue`
component is used.

<<< ./snippets/NewsletterSubscriptionModal.vue [NewsletterSubscriptionModal.vue]

:::

## Option style

### Minimal form

Component definitions are simple objects that look a lot like how component
themselves are written in Vue's Option API. In its simplest form a [
`ComponentDefinition`](/api-reference/plugin-panoramique.componentdefinition) is
an object that associates a Vue component as the `type` with an `id` used to
reference it in other definitions:

```ts
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

// [!code focus:100]
export const emailPromptDefinition = {
	id: 'email-prompt',
	type: NewsletterSubscriptionModal,
};
```

Using an `id` that id not the component's `name` allows us to use a Vue
component in more than one definition. Making it possible to reuse UI elements
in multiple plugins, for example to make a menu with standardised buttons each
added by their own plugin without needing to create a wrapper component for each
one.

<!--@include: ./__bare-vue-template.md-->

### Passing `props`

Vue components really shine when you interact with them by passing them data
through props. You can do the same with definitions :

```ts
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

// [!code focus:100]
const email = ref(''); // [!code highlight]

export const emailPromptDefinition = {
	id: 'email-prompt',
	type: NewsletterSubscriptionModal,
	props: { // [!code highlight:11]
		// giving a direct value
		label: 'The email address to subscribe with',
		// using a ref
		email: email,
		// passing model modifiers
		emailModifiers: {
			lazy: true,
			trim: true,
		},
	},
};
```

Like when passing props in a Vue template you can provide a direct value, a
`ref`, `computed` or `reactive`, or a reactive getter.

When binding to a [`v-model`](
https://vuejs.org/guide/components/v-model.html#component-v-model) any update
sent by the component will be caught and applied to the harness created by the
definition. On top of that you can also provide model modifiers by adding a
property following the pattern `${propName}Modifier` where `propName` is the
name of the model property.

<!--@include: ./__props-vue-template.md-->

### Listening to `events`

Vue components and the underlying HTMLElements that make them up can emit events
you can listen and react to. You can do the same with the `events`
property on your definitions :

```ts
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

// [!code focus:100]
export const emailPromptDefinition = {
	id: 'email-prompt',
	type: NewsletterSubscriptionModal,
	props: { /* props as explained above */ },
	events: { // [!code highlight:11]
		// listening for native events
		focusin: [
			// let's assume we have to send an analytics event via a service
			() => analyticsService.send('newsletter-interacted'),
		],
		// listening for component events
		'before-submit': [
			(event: SubmitEvent) => { /* very important stuff to do before submitting */ },
		],
	}
};
```

While you can listen to both component and native events at once, that only
works as long as they don't share the same name, in which case the listener will
be attached to the component event and the native event will be silenced. This
is driven by how Vue handles events.

Unlike in Vue templates you can register more than one listener per event, this
makes it easier to register listeners from other plugins once the definition is
registered and turned into a harness. Do note that the order in which listeners
are invoked for a given event is not guarantied as listeners can be added or
removed at any time.

<!--@include: ./__events-vue-template.md-->

### Filling slots with `children`

Vue allows you to define slots for your components to inject elements and other
components in their children. Panoramique allows you to do that dynamically when
the component is mounted instead of statistically in the template, we will cover
this in more detail
in [Parent-Child relationships](./parent-child-relationships).

Similarly to how slot works in vue template you can omit the slot name if you
only want to target the `default` slot but can also use multiple one by passing
an object.

```ts
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

// [!code focus:100]
export const emailPromptDefinition = {
	id: 'email-prompt',
	type: NewsletterSubscriptionModal,
	props: { /* props as explained above */ },
	events: { /* events as explained above */ },
	// Using named slots // [!code highlight:5]
	children: {
		default: [ 'child-in-default-slot' ],
		footer: [ 'child-in-named-slot' ],
	},
};

// OR

export const emailPromptDefinitionNoFooter = {
	id: 'email-prompt',
	type: NewsletterSubscriptionModal,
	props: { /* props as explained above */ },
	events: { /* events as explained above */ },
	// Using the default slot only // [!code highlight:2]
	children: [ 'child-in-default-slot' ],
};
```

The above `emailPromptDefinition` definition is the equivalent of the below Vue
template :

```vue
// [!code focus]
<script>
	import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';
	import ChildInDefaultSlot from './ChildInDefaultSlot.vue';
	import ChildInNamedSlot from './ChildInNamedSlot.vue';
	// [!code focus:100]
</script>

<template>
	<NewsletterSubscriptionModal>
		<template> <!--[!code highlight:6]-->
			<ChildInDefaultSlot/>
		</template>
		<template #footer>
			<ChildInNamedSlot/>
		</template>
	</NewsletterSubscriptionModal>
</template>
```

::: details Example of an option style definition using all of the above

<<< ./snippets/option-definition.js

:::

## Setup style

To avoid confusion with Vue's Composition API, and because it doesn't fit its
definition, the functional way of writing component definition is called
`setup`. To write definitions that way you will use the
`defineComponentDefinition`
helper (yes the name is stupid, feel free to suggest a better one).

`defineComponentDefinition` takes an id, a vue component and an optional setup
function and return a fully formed definition you can register. It makes it
easier to group property, event listeners and children binding by context
instead of by type.

Because of technical limitations composable helpers used to add props, event
listeners and children are not exposed at the module level like it is the case
of, for example, plugin life cycle helper, but they are provided to the setup
function as a context object passed as the one and only argument. This can mean
a small increase of dead code in your final bundle size if you never use one of
them, but it is unlikely in a large enough application.

### Minimal form

A minimal definition providing only the `id` and `type` would look like this :

```ts
import { defineComponentDefinition } from '@xoram/plugin-panoramique';
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

defineComponentDefinition( // [!code focus:14]
	/* [!hint: id:] */'email-prompt',
	/* [!hint: component:] */NewsletterSubscriptionModal
);
```

<!--@include: ./__bare-vue-template.md-->

### Setting props with `bind`

The `bind` helper allows you to set the value a component prop will be set to
when the component is mounted, it is the equivalent of the
[`v-bind:`](https://vuejs.org/api/built-in-directives.html#v-bind)
directive you would use in a Vue component template. You can also specify
[modifiers](https://vuejs.org/guide/essentials/forms.html#modifiers) if the prop
you are targeting is a model.

<<< ./snippets/bind-example.ts

<!--@include: ./__props-vue-template.md-->

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

The above `emailPromptDefinition` definition is the equivalent of the below Vue
template :

```vue
// [!code focus]
<script>
	import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';
	import ChildInDefaultSlot from './ChildInDefaultSlot.vue';
	import ChildInNamedSlot from './ChildInNamedSlot.vue';
	// [!code focus:100]
</script>

<template>
	<NewsletterSubscriptionModal>
		<template> <!--[!code highlight:9]-->
			<ChildAtTheStart/> <!-- [!annotation: (c)] -->
			<ChildAtIndex/> <!-- [!annotation: (d)] -->
			<ChildInDefaultSlot/> <!-- [!annotation: (a)] -->
		</template>
		<template #footer>
			<ChildAtIndexFromTheEnd/> <!-- [!annotation: (e)] -->
			<ChildInNamedSlot/> <!-- [!annotation: (b)] -->
		</template>
	</NewsletterSubscriptionModal>
</template>
```

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

## Using Typescript

When using the `setup` style you don't have anything to do as it will
automatically infer props, events and slots from the component's type if you
have configured your environment correctly,
see [Using Vue With TypeScript](https://vuejs.org/guide/typescript/overview.html#using-vue-with-typescript)
for explanations on how to do so.

For the `option` style you can use the `satisfies` keywords like so :

```ts
import type { ComponentDefinition } from '@xoram/plugin-panoramique';

export const emailPromptDefinition = { // [!code focus:100]
	id: 'email-prompt',
	type: NewsletterSubscriptionModal,
	props: { /* typed props */ },
	events: { /* typed events */ },
	children: { /* typed children */ },
	// [!code highlight]
} satisfies ComponentDefinition<typeof NewsletterSubscriptionModal>;
```

Make sure to pass the component you are using prefixed with `typeof`, not doing
so will result in a type error.

Additionally, if you don't need an intermediary `const` to hold your definition
you can write it inline as you call the `register` helper or method (more about
them on the next page) :

```ts
import { definePlugin } from '@xoram/core';
import { register } from '@xoram/plugin-panoramique';
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

export default definePlugin(() => { // [!code focus:9]
	register({ // [!code highlight:7]
		id: 'email-prompt',
		type: NewsletterSubscriptionModal,
		props: { /* typed props */ },
		events: { /* typed events */ },
		children: { /* typed children */ },
	});
})
```