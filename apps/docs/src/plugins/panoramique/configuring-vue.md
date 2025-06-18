# Configuring the Vue instance

When building your components it is likely that you might need to update the
configuration of the Vue instance, for registering a Vue plugin for example. You
can do so via the `app` property available on the `vue` service registered by
panoramique.

Become most plugins are used in components it's important they are added before
those components are mounted, this means you should only modify the vue
configuration in a `onBeforeCreate` hook. That way the Vue app has already been
registered but no component has been registered into panoramique yet.

For example if you wanted to provide `vue-router` via a plugin it could look
like this&nbsp;:

```ts [vue-router.plugin.ts]
import { panoramiquePlugin } from '@zoram-plugin/panoramique';
import {
	addService,
	definePlugin,
	dependsOn,
	onBeforeCreate
} from '@zoram/core';
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