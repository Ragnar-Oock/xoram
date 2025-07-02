# Configuring the Vue instance

When building your components it is likely that you might need to update the
configuration of the Vue instance, for registering a Vue plugin for example. You
can do so via the `app` property available on the `vue` service registered by
panoramique.

Because most plugins are used in components or in code invoked by components
it's important they are added before those components are mounted, this means
you should only modify the vue configuration in a `onBeforeCreate` hook. That
way the Vue app has already been registered but no component has been registered
into panoramique yet.

For example if you wanted to provide `vue-router` via a plugin it could look
like this:

```ts [router.plugin.ts]
import { panoramiquePlugin } from '@xoram/plugin-panoramique';
import {
	addService,
	definePlugin,
	dependsOn,
	onBeforeCreate
} from '@xoram/core';
import { createRouter } from 'vue-router'

export const vueRouterPlugin = definePlugin(() => {
	// remember to declare the dependency
	dependsOn(panoramiquePlugin);

	onBeforeCreate(app => {
		// Use a Vue plugin
		app.services.vue
			.app.use(createRouter({ /* vue router config goes here */ }));
	})
});
```

## Mounting the app

Panoramique doesn't mount the Vue app to the DOM for you, it is up to you to
decide when and where to do it. While there is no strict guideline for how to do
it, it is a good idea to delegate that task to a single plugin. That way plugins
that add component at the root of your application can declare a dependency to
it if you want to make sure those components are mounted when the plugin is
loaded.

<<< ./snippets/mount-app.plugin.ts

## Unmounting the app

Unlike for mounting, you don't have to unmount your Vue app when you are done
with it, you can destroy the xoram instance and panoramique will automatically
unmount the Vue app if it is still mounted.

You can however unmount the app manually just like you mounted it :

<<< ./snippets/unmount-app.plugin.ts

## Multiple Vue applications

Panoramique doesn't support using more than one Vue application per xoram
instance, if you need multiple Vue apps on the same page you should create
multiple xoram instances.

If you need to have your application present in multiple places on the page, for
example a modal ui that can be opened from multiple interactive elements on the
page, you can use the [`<Teleport/>`](
https://vuejs.org/guide/built-ins/teleport.html) component provided by Vue.