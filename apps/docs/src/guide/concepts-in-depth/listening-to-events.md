# Listening to events

While services allow plugins to expose logic and data between themselves, events
are how plugins are notified that something happened in one of their
dependencies.

## Why use events instead of methods ?

Using events allows you to leverage
the [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
when defining your plugins. Let's say we have the following setup :

- `PersonPlugin` that registers a `person` service that tracks a list of persons
- `NewPersonToastPlugin` that shows a notification to the user when a person is
  registered in the `person` service via a `toast` service
- `PersonRemovedMailPlugin` that send a mail when a person is removed from the
  `person` service
- `SyncPersonWithServerPlugin` that keeps the list of persons in the service in
  sync with a server backup

Without using events we would need to have the `PersonPlugin` call a method of
the `toast` service added by `NewPersonToastPlugin` whenever
`SyncPersonWithServerPlugin`
adds a person to the list. We would have a dependency graph looking like :

- `PersonPlugin` depends on `NewPersonToastPlugin`
- `SyncPersonWithServerPlugin` depends on `PersonPlugin`
- `NewPersonToastPlugin` depends on nothing (assuming the `toast` service does
  not use types coming from the `person` service)

```
SyncPersonWithServerPlugin
└─▶ depends on PersonPlugin
    ├─▶ depends on NewPersonToastPlugin
    └─▶ depends on PersonRemovedMailPlugin
```

If at a latter date we need to add a mail notification via a `mail` service when
a person is removed from the service we would need to add another dependency to
`PersonPlugin`. The issue here is that we would directly reference the `mail`
and `toast` services and their methods, leading to strong coupling between our
plugins.

Events allow us to reverse the dependencies of `PersonPlugin` so that it does
not need to know if something happens when a person is added or removed from its
internal list. By emitting an event when a person is added and one where the
person is removed it's possible to implement the logic of `NewPersonToastPlugin`
and `PersonRemovedMailPlugin` without having any strong connexion between them
make it possible to remove one or the other if they are not needed

The dependency graph would then look like :

```
SyncPersonWithServerPlugin
└─▶ depends on PersonPlugin

NewPersonToastPlugin
└─▶ depends on PersonPlugin

PersonRemovedMailPlugin
└─▶ depends on PersonPlugin
```

## Adding a listener

Event listeners are added in a plugin, by passing a target, the name of an event
and a handler function to the `onEvent` function.

If we wanted to listen for the `added` event on the `person` service it would
look like :

```ts
import { definePlugin } from '@zoram/core';

definePlugin(() => {
	onEvent( // [!code focus:5]
		/* target */ 'person',
		/* event */ 'added',
		/* handler */ event => { /* show the toast */
		}
	);
});
```

Here we used the service's id to subscribe to it, under the hood it was resolved
to the service instance in the application the current plugin is deployed in.

## When to add a listener

Because `onEvent` is integrated with a plugin's hook it needs to be used in the
context of a plugin. This means you can only call `onEvent` as part of a
plugin's setup function or in a plugin's hook.

## Multiple ways of identifying a target

Because both application, services and the plugin's internal code can emit
events we might need to target things that can't be identified by a service id.
For this reason `onEvent` accepts different kinds of target identifier:

- **direct emitter** : an emitter object, you might have created it as part of
  you plugin's code or could have retrieved it in the application.

```ts
import { definePlugin } from '@zoram/core';

definePlugin(() => {
	const myEmitter = emitter();

	onEvent(myEmitter, 'added', event => { // [!code focus:3]
		/* do the thing */
	});
});
```

- **emitter container** : an object that has an `emitter` property holding an
  emitter, because having to write `app.emitter` or `myService.emitter` over and
  over is tedious and adds a lot of noise in your code.

[//]: # (@formatter:off)
```ts
import { definePlugin, onCreated } from '@zoram/core';

definePlugin(() => {
	onCreated(app => { // [!code focus:5]
		onEvent(app, 'pluginRegistered', event => {
			/* I'm a unicorn */
		}); 
	})
});
```
[//]: # (@formatter:on)

- **direct emitter getter** : a function that takes the current application
  instance and returns an emitter object.

```ts
import { definePlugin, onCreated } from '@zoram/core';

definePlugin(() => {
	onEvent(app => app.services.person.emitter, 'added', event => { // [!code focus:3]
		/* new person in the place */
	});
});
```

- **emitter container getter** : a function that takes the current application
  instance and returns an **emitter container**.

```ts
import { definePlugin, onCreated } from '@zoram/core';

definePlugin(() => {
	onEvent(app => app.services.person.get('bob'), 'name_changed', event => { // [!code focus:3]
		/* hello boris */
	});
});
```

- **service id** : the id of a service available in the application.

```ts
import { definePlugin, onCreated } from '@zoram/core';

definePlugin(() => {
	onEvent('myService', 'myEvent', event => {
		/* it happened ! */
	});
});
```

Those multiple ways of getting a reference to a target aim's to provide as many
tools as possible to make your code concise and remove boilerplate. While there
is no preferred way of referencing a target, it is advised that you stay
consistent in its use at least within a single plugin's code.

## Listening to multiple events at once

You might find yourself in a situation where you want to listen to 2 or 3 events
from an emitter and do the same thing with all of them, or listen to everything
and do the routing yourself.

### Listening to all events

If you need to listen to all the events of an emitter you can pass the wildcard
event `'*'`.

```ts
import { definePlugin, onCreated } from '@zoram/core';

definePlugin(() => {
	onEvent('person', '*', (type, event) => { // [!code focus:3]
		/* runs for all events */
	});
});
```

::: tip Note that the handler now takes 2 parameter, the name of each event
received and the event payload.
:::

### Listening to a set of events

If you need to listen to a predefined set of events you can pass them as an
array.

```ts
import { definePlugin, onCreated } from '@zoram/core';

definePlugin(() => {
	onEvent('person', [ 'added', 'removed' ], event => { // [!code focus:3]
		/* runs for selected events */
	});
});
```

::: tip Note that the type of the payload will be restricted to the intersection
of the types of all the events listed. If you need to handle some events
differently than other prefer registering their listeners independently.
:::

## Removing listeners

Listeners are automatically removed during the plugin's `teardown` phase but if
you need to remove them manually before that you can invoke the cleanup function
returned by `onEvent`.

```ts
import { definePlugin, onCreated } from '@zoram/core';

definePlugin(() => {
	const cleanup = onEvent(/* ... */); // [!code focus]

	onEvent('otherService', 'event', () => cleanup()); // [!code focus]
});
```

The cleanup function is **idempotent** and **safe**, there is no issue with
calling it multiple times, either from multiple event listeners or from multiple
instances of the same event, so you don't need to keep additional logic to
prevent subsequent calls.

## Dealing with errors in listeners

If a listener came to throw an error or invoke a function itself throws, the
error would be caught by `onEvent` to make sure it doesn't interfere with other
even listeners that might share the same target and event. This means that an
action leading to the dispatching of an event will always succeed, but it also
means your code might end up in an invalid state.

It is advised that you deal with the error as close as possible to its source to
avoid it being caught by zoram for you.

::: tip In dev mode error caught in that way will be pretty printed in the
console alongside the application's and plugin's id.
:::