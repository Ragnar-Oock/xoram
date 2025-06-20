# Plugin Life Cycle

Plugins interact with each others and the application through life cycle hooks
that are invoked at key points in the life of the plugin. Because plugins are
meant to have separate instance per applications all hooks are invoked in the
context of an application.

## Setup

It's where the plugin is defined, it is invoked when a plugin enters the
initialization process when you add it to an app, either via the initial config
or at a latter date via `addPlugin`.

From here you will be able to :

- register listeners to other hooks
- register services with [`addService`](./adding-services)
- declare your dependency on other plugins with [
  `dependsOn`](./handling-dependencies)
- interact with native APIs or external libraries

and much more...

The `setup` hook is the only hook that is called without respecting the
dependencies of the plugin, for the simple reason that at that point we haven't
declared them yet. So if you need to access a service exposed by another plugin
or the application you should use one of the other hooks listed below.

`setup` is also special in the sense that it is the only hook that is called
without a reference to the current application because at the moment it is
called said application doesn't exist yet.

## BeforeCreate

Called after dependency resolution and before the plugin is added to the
application.

After that point all hooks are invoked in order of dependency, plugins that have
no dependency are called first then come the plugins that depends on them and so
on.

It's the first hook that is invoked after `setup`, it is used internally by
`addService` and other built-ins to prepare the plugin for instantiation. If you
need to create Workers or initialize a third party library this is the place to
do it. At that point the plugin is still is not completely part of the
application.

```js
import {onBeforeCreate} from '@xoram/core';

onBeforeCreate(app => { // [!code focus:3]
	/* pre-initialization logic */
});
```

## Created

Called after the plugin is added to the application.

At that point the plugin is fully part of the application and all services are
ready to be used, if your plugin needs to invoke a service's method or access
one of its properties it's the place to do it.

```js
import {onCreated} from '@xoram/core';

onCreated(app => { // [!code focus:3]
	/* startup the plugin logic */
})
```

## BeforeDestroy

Called just before a plugin is removed from the application.

Use this hook for any teardown logic. If your plugin uses persistent logic you
should clean it up here.

This hook is useful during development as it will be invoked before a plugin is
replaced by its updated counterpart.

```js
import {onCreated} from '@xoram/core';

onBeforeDestroy(app => { // [!code focus:3]
	/* teardown logic goes here */
})
```

## Destroyed <Badge type="tip" text="internal" />

Called after a plugin has been removed from the application.

It is mainly used by the devtools. No helper is available for this hook, this
section is for completeness' sake only.
