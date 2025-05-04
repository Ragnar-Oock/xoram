# Services

Services are the public API of a plugin, they allow you to expose logic and 
state to other plugins in a controlled manner.

## Structure

A service at it's simplest is an object with an `emitter` that can broadcast 
events for plugins to subscribe to. Such barebones services can be referred to as
`topics` because they only serve as hubs for events that can come from a plugin's
logic or from external libraries you might expose the life cycle of.

Such a service can be defined by invoking the `defineService` function with no
parameter :
```ts
import {defineService} from '@zoram/core';

export type MyNotifications = {
    myEvent: {prop: "I'm an event!"},
};

export const myService = defineService<MyNotifications>();
```

Note the generic parameter passed to `defineService`, it is used to type the 
events that you will emit from the service. 

TODO: add details on typed event

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
- the application instance, useful if your service has dependencies on another 
one or if you want it to subscribe to application events
- the emitter that will be attached to the service, so you can emit the events 
you declared on you interface

## Adding your service to your app

Registering your service in the app can only be done in a plugin's setup using
the `addService` function.

```js
import {myService} from './my-service';

export default definePlugin(() => {
    addService(Symbol('my-service'), myService);
})
```

You can't use `addService` at any other time because it would mean that a plugin
that depends on yours might try to access your service before it is added to
the app. If you need to delay the registration of a service use an AsyncPlugin 
instead.

NOTE : add a page and link to the AsyncPlugin doc