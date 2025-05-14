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
import { defineService } from '@zoram/core';

export type MyNotifications = {
	myEvent: { prop: "I'm an event!" },
};

export const myService = defineService<MyNotifications>();
```

```js [JavaScript]
import {defineService} from '@zoram/core';

export const myService = defineService();
```

:::

Note the generic parameter passed to `defineService` in the typescript version,
it is used to type the events that you will emit from the service. You can learn
more about typed event
on [their dedicated page](/guide/concepts-in-depth/typing-events).

## Defining a service

You can create a service by passing a factory function to `defineService` :

```js
import {defineService} from '@zoram/core';

export const myService = defineService((app, emitter) => ({
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

## Adding your service to your app

Registering your service in the app can only be done in a plugin's setup using
the `addService` function.

You can't use `addService` at any other time because it would mean that a plugin
that depends on yours might try to access your service before it is added to the
app. If you need to delay the registration of a service use
an [AsyncPlugin](../concepts-in-depth/asynchronous-plugins.md) instead.

```js
import {myService} from './my-service';

export default definePlugin(() => {
	addService( /* id */ 'myService', /* serviceFactor*/ myService);
})
```

Note that we also provided a string id when we called `addService`, this is the
key that you will use to retrieve the service on the application when you need
it. We are providing it here instead of when calling `defineService`
because services can be made generic to be used across multiple plugins, if we
hard coded the id in the definition we would need to duplicate the call to
`defineService` each time we want to use a new instance of a generic service.

## Registering a Service in Your Plugin

To add a service to your application, you must register it during the plugin's
`setup` phase using the `addService` function. This ensures that any plugins
depending on your service can access it reliably.

::: warning

⚠️ `addService` **must only be called during plugin setup**. Calling it at any
other time can lead to errors if another plugin tries to access your service
before it's been registered and is thus not allowed. If you need to register the
service asynchronously, consider using
an [AsyncPlugin](/guide/concepts-in-depth/asynchronous-plugins).

:::

```js
import {myService} from './my-service';

export default definePlugin(() => {
	addService('myService', myService);
});
```

In this example, `'myService'` is the **service ID**. You'll use this ID later
to retrieve the service from the application.

We specify the ID here rather than in the service definition because services
can be generic and reused across multiple plugins. If the ID were hardcoded
inside the service itself, you'd have to redefine the service each time you
wanted a new instance with a different ID.
