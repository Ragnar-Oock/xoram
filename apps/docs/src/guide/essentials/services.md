# Services

Services are the public API of a plugin, they allow you to expose logic and
state to other plugins in a controlled manner.

## Structure

A service at it's simplest is an object with an `emitter` that can broadcast
events for plugins to subscribe to. Such barebones services can be referred to
as
`topics` because they only serve as hubs for events that can come from a
plugin's logic or from external libraries you might expose the life cycle of.

Such a service can be defined by invoking the `defineService` function with no
parameter :
::: code-group

```ts [TypeScript]
import { defineService } from '@xoram/core';

export type MyNotifications = { // [!code focus:6]
	myEvent: { prop: "I'm an event!" },
};

export const myService = defineService<MyNotifications>(); 
```

```js [JavaScript]
import {defineService} from '@xoram/core';

export const myService = defineService(); // [!code focus]
```

:::

Note the generic parameter passed to `defineService` in the typescript version,
it is used to type the events that you will emit from the service. You can learn
more about typed event
on [their dedicated page](/guide/concepts-in-depth/typing-events).

## Defining a service

You can create a service by passing a factory function to `defineService` :

```js
import {defineService} from '@xoram/core';

export const myService = defineService((app, emitter) => ({ // [!code focus:3]
	myProp: 'hello'
}));
```

The factory function will get the application instance as its first parameter,
useful if your service depends on another one or if it needs to subscribe to
events emitted by the application,

The factory function will be invoked with two parameters:

- the **application instance**, useful if your service has dependencies on
  another one or if you want it to subscribe to application events
- the **emitter** that will be attached to the service, so you can emit the
  events you declared on you interface

## Registering a service in your plugin

To add a service to your application, you must register it during the plugin's
`setup` phase using the `addService` function. This ensures that any plugins
depending on your service can access it reliably.

::: warning

⚠️ `addService` **must only be called during plugin setup**. Calling it at any
other time can lead to errors if another plugin tries to access your service
before it's been registered and is thus not allowed. If you need to register the
service asynchronously, consider using
an [asynchronous plugins](../concepts-in-depth/grouping-plugins.md).

:::

```js
import {myService} from './my-service';

export default definePlugin(() => { // [!code focus:3]
	addService('myService', myService);
});
```

In this example, `'myService'` is the **service ID**. You'll use this ID later
to retrieve the service from the application.

We specify the ID here rather than in the service definition because services
can be generic and reused across multiple plugins. If the ID were hardcoded
inside the service itself, you'd have to redefine the service each time you
wanted a new instance with a different ID.
