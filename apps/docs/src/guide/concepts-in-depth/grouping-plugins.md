# Grouping plugins

So far when we wanted to add a plugin to our app we had to do it at the creation
of said app, while this is straight forward it might become unwieldy if we have
a lot of plugins, no one like having to go through multiple hundred lines of
imports...

## Composing plugin lists

To avoid that we could group plugin into groups related to a topic, feature or
any other metric you might imagine, import those groups and compose them into
the final application config like we saw
when [talking about applications](/guide/essentials/application.html#using-multiple-apps) :

::: code-group

```ts [app.ts]
import { createApp } from "@xoram/core";
import { analyticsPlugins } from '@company/analitics';
import { analyticsPlugins } from '@company/analitics';
import { corePlugins } from '@company/framework';
import { baseFeaturePlugins } from "@company/product";

createApp([ // [!code focus:5]
	...analyticsPlugins,
	...baseFeaturePlugins,
	...corePlugins
])
```

:::

But what if we want to load a plugin only if some conditions are met ? We could
check that condition in our application's creation process, but it's more than
likely that this condition requires some logic we implemented in one of our
plugins. So why not load those optional plugins directly from a plugin ?

## Introducing `addPlugin` and `addPlugins`

We can in fact do just that. If we call `addPlugin` and pass in the plugin we
want to register it will be loaded in the current application if all it's
dependencies are met. `addPlugins` works much the same way but can load multiple
plugins at once and handle dependency resolution between them.

For example, let's say we are making an SSR based website, and we want to change
the options available in the overhead menu when the user is logged in. For this
we could have a plugin that looks at if the users is logged in or not and load
the appropriate options to be rendered. It could look something like this, where
when the `topBarMenu` plugin is loaded it checks if the current user is logged
in or not and loads the appropriate plugin. The implementation of the menu
plugins are left as an exercise of the mind.

::: code-group

```ts [top-bar-menu.plugin.ts] :line-numbers
import { addPlugin, definePlugin, onCreated } from '@xoram/core';
import userAccess from './user-access/user-access.plugin';
import authenticatedUserMenu  // [!code highlight:4]
	from './authenticated-user-menu/authenticated-user-menu.plugin';
import defaultMenu
	from './header-menu/header-menu.plugin';

export default definePlugin('topBarMenu', () => {
	dependsOn(userAccess.id);

	onCreated(({ services }) => { // [!code focus:8]
		if (services.user.isAuthenticated()) {
			addPlugin(authenticatedUserMenu);
		}
		else {
			addPlugin(defaultMenu);
		}
	})
});
```

```ts [authenticated-user-menu.plugin.ts] :line-numbers
import { definePlugin } from "@xoram/core";

export default definePlugin('authenticated-user-menu', () => { // [!code focus:3]
	/* render the menu options for the logged in user */
})
```

```ts [header-menu.plugin.ts] :line-numbers
import { definePlugin } from "@xoram/core";

export default definePlugin('authenticated-user-menu', () => { // [!code focus:3]
	/* render the default menu options */
})
```

```ts [user.plugin.ts] :line-numbers
import { definePlugin, addService } from '@xoram/core';
import userService from './user.service';

export default definePlugin('user', () => { // [!code focus:3]
	addService('user', userService);
});
```

```ts [user.service.ts] :line-numbers
import { defineService } from '@xoram/core';

export default defineService(() => { // [!code focus:3]
	/* immagine there's an authentication service here */
})
```

:::

While this approach allows us to load only specific plugins into the application
it might trigger an alarm in your head if you have had to optimise frontend
applications for load time. Indeed, while we are not loading the plugins into
the app we are loading their files anyway because we use static imports (<button
@click="showImports">see lines 3 to 6 of `top-bar-menu.plugin.ts`</button>)

<script setup>
function showImports() {
	const tab = document.querySelector('[data-title="top-bar-menu.plugin.ts"]');
  tab?.click();
	tab?.scrollIntoView({behavior: 'smooth'});
}
</script>

This means that, if we were making a frontend app, both the
`authenticatedUserMenu` and the `defaultMenu` plugin would be part of the file
final bundle even tho only one of them will ever be active at once, uselessly
increasing page load. And yes it might be just a few kilobytes, but now imagine
that we have hundreds of plugins making up our app and that most of them are
only active in specific situations, it would be counterproductive to load them
all only for a minority of them being executed at all.

So why not change the imports to make them asynchronous instead? Something like
that, maybe.

::: code-group

```ts [top-bar-menu.plugin.ts] :line-numbers
import { addPlugin, definePlugin, onCreated } from '@xoram/core';
import userAccess from './user-access/user-access.plugin';
import authenticatedUserMenu  // [!code --:4]
	from './authenticated-user-menu/authenticated-user-menu.plugin';
import defaultMenu
	from './header-menu/header-menu.plugin';

export default definePlugin('topBarMenu', () => {
	dependsOn(userAccess.id);

	onCreated(async ({ services }) => {
		if (services.user.isAuthenticated()) {
			addPlugin(authenticatedUserMenu); // [!code --]
			// using promise syntax // [!code ++:3]
			import('./authenticated-user-menu/authenticated-user-menu.plugin')
				.then(mod => addPlugin(mod.default));
		}
		else {
			// using async/await // [!code ++:2]
			const defaultMenu = await import('./header-menu/header-menu.plugin').default;
			addPlugin(defaultMenu);
		}
	})
});
```

:::

If you try to run this plugin as part of your app you will get a warning that
reads *"addPlugin called outside an application context and no app instance
passed as parameter."* and possibly errors because the `created` hook now has to
deal with an asynchronous handler, something it is not meant to do. This is
because `addPlugin` has to know to what application it should add the plugin
especially in cases where multiple application instances might exist on the same
page. We could fix the warning by passing the application we received as the
parameter of our hook, but that will do nothing to fix the errors the
asynchronicity of our function might have introduced. So we will need another
way of doing this...

## Introducing `defineAsyncPlugin`

Like its name suggests `defineAsyncPlugin` allows us to define a plugin that
will be executed asynchronously, this means we can use the asynchronous
`import()` without getting warnings or breaking other plugins because we
introduced asynchronous hooks.

Unlike `definePlugin` which takes a setup function to create a plugin,
`defineAsyncPlugin` takes 2 asynchronous functions (or synchronous function
returning a Promise), and an optional dependency list. The first function is in
charge of importing asynchronously the plugins we want to register (it can
return a single plugin or an array of them) and the second should return a
promise that will resolve when we want to load our plugins.

Refactoring our initial `top-bar-menu.plugin` with it would look like this :

::: code-group

```ts [top-bar-menu.plugin.ts] :line-numbers
import { addPlugin, definePlugin, onCreated } from '@xoram/core';
import userAccess from './user-access/user-access.plugin';

export default defineAsyncPlugin(
	/* importer */ async ({ services }) => services.user.isAuthenticated()
		? (await import('./authenticated-user-menu/authenticated-user-menu.plugin')).default
		: (await import('./header-menu/header-menu.plugin')).default,
	/* when */ async () => void 0, // execute the plugin immediatly
	/* dependencies */ [ userAccess.id ],
)
```

:::

This new plugin, systematically anonymous, will wait for all the static plugins
to be instanced and then import the required plugin depending on the logic we
decided on (here whether the user is logged in or not). And thanks to the
dependency on `userAcess` we are sure that our async plugin will be loaded after
`userAcess` has registered it's service so we can use it in the importer.

Alternatively, instead of having one plugin the decides what plugin to load in
each case we could have 2 that each load asynchronously one plugin making it
easier to add more cases as the needs arises, keeping it as atomic as possible

::: code-group

```ts [authenticated-user-menu.async-plugin.ts] :line-numbers
import { addPlugin, definePlugin, onCreated } from '@xoram/core';
import userAccess from '../user-access/user-access.plugin';

export default defineAsyncPlugin(
	async ({ services }) => {
		if (services.user.isAuthenticated()) { // [!code highlight:3]
			return (await import('./authenticated-user-menu.plugin')).default;
		}
	},
	async () => void 0, // execute the plugin immediatly
	[ userAccess.id ],
)
```

```ts [default-menu.async-plugin.ts] :line-numbers
import { addPlugin, definePlugin, onCreated } from '@xoram/core';
import userAccess from '../user-access/user-access.plugin';

export default defineAsyncPlugin(
	async ({ services }) => {
		if (!services.user.isAuthenticated()) { // [!code highlight:3]
			return (await import('./header-menu.plugin')).default;
		}
	},
	async () => void 0, // execute the plugin immediatly
	[ userAccess.id ],
)
```

:::

## Choosing between `addPlugin` and `defineAsyncPlugin`

While `defineAsyncPlugin` gives us the possibility to split our application into
smaller chunk it has a certain cost :

### Slightly higher overall bundle size

Because we need to declare an additional plugin per chunk to handle the
asynchronous import and because of the implementation overhead of
`defineAsyncPlugin` (even if this should be a rounding error in your final
bundle size as it comes at under 300 bytes once minified).

### Longer Time-to-Interactive

Because some part of our app is now loaded asynchronously it is possible that so
parts of it are not available when the user first interactive with them,
especially in the example we went through where the menu's content would be
unavailable until the import resolves and the plugin are added. We could make it
less impactful or even invisible by biting the bullet, systematically loading
the default menu and replacing its content with the logged version once it's
available, but this might not be an option, or it can introduce other issues
like Content Layout Shift if we replace UI elements that are visible on screen
at all time.

### More complex dependency tree

Because not all our plugins are loaded in the application at the same time
anymore, we might find ourselves with dependencies that fails to resolve in the
static plugin list, requiring us to move them to our newly created chunk or
change their dependencies all together.

