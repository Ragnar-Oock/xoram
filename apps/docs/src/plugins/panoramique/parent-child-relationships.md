# Parent-Child relationships

<!--@include: ./__start-at-beginning.md -->

Being able to register components in panoramique allows us to add them when we
want directly from our plugins, but what if we want to move them or to not have
the same set of children at all time ?

If you remember when we went over `ComponentDefinition` we said that the
difference between a definition and a harness is that a modification on a
harness will update the corresponding component when it is mounted. This means
that if we have a reference to that harness we can modify its props and event
listeners but more importantly the components that will be mounted in its slots.

Setting the parent-child relationship outside the component definition has the
advantage of making plugins easier to re-use across contexts. For example if you
make a text editor you might want to have a menu bar were available actions are
listed (bold, italic, underline, inserting images...) To do that you might want
to have a plugin define the menu and each plugin would register its button and
where to add it in the menu. That way if you want to add or remove a feature,
like bolding text, both the underlying functionality and the UI element that
triggers it are added and removed as one.

## Adding children

Like for registering component there is two ways of adding children to another
component :

- the `addChild` helper : for when you don't care when the parent-child
  relationship is established
- the service `addChild` method : for when you want to control when the
  relationship is set

### The `addChild` helper

In most cases you don't need to control when a component is the child of
another, all you care about is that when the plugin is loaded the related
components are bound to where you defined them to be. Usually that means adding
the relationship as soon as possible in the plugin's lifecycle and removing it
when the plugin is removed if that ever happens.

The `addChild` helper do just that, it adds the relationship on `created`
and removes it on `beforeDestroy`, and just like `register` it adds the
dependency to panoramique for you (but you can add it yourself too if you prefer
being explicit).

```ts
import { addChild } from '@zoram-plugin/panoramique';
import { definePlugin } from '@zoram/core';
import { emailPromptDefinition } from './definitions';

// [!code focus:200]
export default definePlugin(() => {
	// add the child at the end of the default slot
	addChild(
		/*[!hint: parent:]*/'modal-container',
		/*[!hint: child:]*/emailPromptDefinition.id,
	);
});
```

::: warning

The `addChild` helper can only be used in a setup function context, invoking it
in a hook or `onEvent` listener is a noop.

:::

### The `addChild` method

It can happen that you need to control when a component is set as the child of
another, for example if you make a customizable UI and allow the user to move
widgets from one list to another.

In that case you can interact with the service directly, in an `onEvent`
listener or anywhere else where you have access to the application.

```ts
import { panoramiquePlugin } from '@zoram-plugin/panoramique';
import { definePlugin, dependsOn, onCreated } from '@zoram/core';
import { emailPromptDefinition } from './definitions';

// [!code focus:200]
export default definePlugin(() => {
	// remember to declare the dependency
	dependsOn(panoramiquePlugin.id);

	onCreated(app => {
		// add the child at the end of the default slot
		app.services.panoramique.addChild(
			/*[!hint: parent:]*/'modal-container',
			/*[!hint: child:]*/emailPromptDefinition.id,
		);
	});
});
```

## Using slots

If you use [`<slots/>`](https://vuejs.org/guide/components/slots.html#slots) in
your vue components you might need to target specific named slots, not just the
default one. To do so you can pass that slot's name as the third parameter of
both the method or the helper.

::: code-group

```ts [helper]
import { addChild } from '@zoram-plugin/panoramique';
import { definePlugin } from '@zoram/core';
import { emailPromptDefinition } from './definitions';

// [!code focus:200]
export default definePlugin(() => {
	// add the child in a named slot
	addChild(
		/*[!hint: parent:]*/'modal-container',
		/*[!hint: child:]*/emailPromptDefinition.id,
		/*[!hint: slot:]*/'named-slot',
	);
});
```

```ts [method]
import { panoramiquePlugin } from '@zoram-plugin/panoramique';
import { definePlugin, dependsOn, onCreated } from '@zoram/core';
import { emailPromptDefinition } from './definitions';

// [!code focus:200]
export default definePlugin(() => {
	// remember to declare the dependency
	dependsOn(panoramiquePlugin.id);

	onCreated(app => {
		// add the child in a named slot
		app.services.panoramique.addChild(
			/*[!hint: parent:]*/'modal-container',
			/*[!hint: child:]*/emailPromptDefinition.id,
			/*[!hint: slot:]*/'named-slot',
		);
	});
});
```

:::

## Ordering children

It can happen that you need to specify where to insert a component in its parent
child list, for example if you need some button to be at the start even if it is
registered later on in the app's lifecycle, or if you allow your user to change
the order of UI widgets.

To do so you can pass an index to the `addChild` method and helper to set the
index where the component will be inserted, note that you will need to provide a
slot name even if you insert in the default slot.

Just like [
`Array.prototype.at()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at)
the index you pass in can be negative to denote an index counting from the end

::: code-group

```ts [helper]
import { addChild } from '@zoram-plugin/panoramique';
import { definePlugin } from '@zoram/core';
import { emailPromptDefinition } from './definitions';

// [!code focus:200]
export default definePlugin(() => {
	// add the child at the start
	addChild(
		/*[!hint: parent:]*/'modal-container',
		/*[!hint: child:]*/emailPromptDefinition.id,
		/*[!hint: slot:]*/'default',
		/*[!hint: index:]*/0
	);
	// add the child at the end
	addChild(
		/*[!hint: parent:]*/'modal-container',
		/*[!hint: child:]*/emailPromptDefinition.id,
		/*[!hint: slot:]*/'default',
		/*[!hint: index:]*/-1
	);
	// add the child somewhere in the middle
	addChild(
		/*[!hint: parent:]*/'modal-container',
		/*[!hint: child:]*/emailPromptDefinition.id,
		/*[!hint: slot:]*/'default',
		/*[!hint: index:]*/5
	);
});
```

```ts [method]
import { panoramiquePlugin } from '@zoram-plugin/panoramique';
import { definePlugin, dependsOn, onCreated } from '@zoram/core';
import { emailPromptDefinition } from './definitions';

// [!code focus:200]
export default definePlugin(() => {
	// remember to declare the dependency
	dependsOn(panoramiquePlugin.id);

	onCreated(app => {
		// add the child at the start
		app.services.panoramique.addChild(
			/*[!hint: parent:]*/'modal-container',
			/*[!hint: child:]*/emailPromptDefinition.id,
			/*[!hint: slot:]*/'default',
			/*[!hint: index:]*/0
		);
		// add the child at the end
		app.services.panoramique.addChild(
			/*[!hint: parent:]*/'modal-container',
			/*[!hint: child:]*/emailPromptDefinition.id,
			/*[!hint: slot:]*/'default',
			/*[!hint: index:]*/-1
		);
		// add the child somewhere in the middle
		app.services.panoramique.addChild(
			/*[!hint: parent:]*/'modal-container',
			/*[!hint: child:]*/emailPromptDefinition.id,
			/*[!hint: slot:]*/'default',
			/*[!hint: index:]*/5
		);
	});
});
```

:::

::: warning

The child index is assigned when you call the `addChild` method or helper, but
it's not guaranteed that your component will stay at that index as other
components might be added later at a lower position.

:::

## Removing children

To break a parent-child relationship—for example, when changing where a
component is mounted—you need to call the `removeChild` method directly on the
store&nbsp;:

```ts
import { panoramiquePlugin } from '@zoram-plugin/panoramique';
import { definePlugin, dependsOn, onCreated } from '@zoram/core';
import { emailPromptDefinition } from './definitions';
// [!code focus:200]
export default definePlugin(() => {
	// remember to declare the dependency
	dependsOn(panoramiquePlugin.id);

	onCreated(app => {
		onEvent(app.services.button, 'clicked', () => {
			app.services.panoramique.removeChild(
				/*[!hint: parent:]*/'modal-container',
				/*[!hint: child:]*/emailPromptDefinition.id
			)
		});
		onEvent(app.services.button, 'clicked', () => {
			app.services.panoramique.removeChild(
				/*[!hint: parent:]*/'modal-container',
				/*[!hint: child:]*/emailPromptDefinition.id
			)
		});
	});
});
```

Panoramique does not provide a `removeChild` helper because helpers require a
reference to the application and plugin that registered them. This reference is
available only within the setup function or during plugin lifecycle hooks, but
not in asynchronous contexts like event listeners. Since `removeChild` is
typically used in response to user actions or other runtime events, it must be
called directly, as helpers in these contexts would fail due to the missing
application reference. With those constraint providing a helper would lead to
unexpected behavior and necessary foot guns.

## Mounting to the application root

For your application to display anything you need to have at least one component
be a child of the `rootHarness`, the component provided to the vue application
as a root.

This special component has only a `default` slot so if you don't need to control
the index of your component when adding it you can omit the slot name :

::: code-group

```ts [helper]
import { addChild, rootHarness } from '@zoram-plugin/panoramique';
import { definePlugin } from '@zoram/core';
import { emailPromptDefinition } from './definitions';

// [!code focus:200]
export default definePlugin(() => {
	// add a component at the root
	addChild(
		/*[!hint: parent:]*/rootHarness,
		/*[!hint: child:]*/emailPromptDefinition.id
	);
});
```

```ts [method]
import { panoramiquePlugin, rootHarness } from '@zoram-plugin/panoramique';
import { definePlugin, dependsOn, onCreated } from '@zoram/core';
import { emailPromptDefinition } from './definitions';

// [!code focus:200]
export default definePlugin(() => {
	// remember to declare the dependency
	dependsOn(panoramiquePlugin.id);

	onCreated(app => {
		// add the child in a named slot
		app.services.panoramique.addChild(
			/*[!hint: parent:]*/rootHarness,
			/*[!hint: child:]*/emailPromptDefinition.id
		);
	});
});
```

:::
