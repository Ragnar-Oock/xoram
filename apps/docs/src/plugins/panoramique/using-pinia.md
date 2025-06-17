# Using Pinia

When building complex application you might need to use Pinia in you own plugins
or components, so you might be happy to learn that under the hood panoramique
uses pinia to store component harnesses and provided them to the Vue app, in
fact the service registered under `panoramique` by the plugin is the pinia store
itself.

## Installation

Panoramique creates a Vue application and binds a Pinia instance to it during
its own initialization, this means you don't have anything to do to set up pinia
and use it in your own component.

::: info

Remember to add it to the dependencies of any plugin whose component⸱s relies on
an export from `pinia` to avoid issues with transitive dependencies.

:::

## Registering stores as services

When you need to interact a lot with complex components or groups of components
in a plugin it might be interesting to move some of the logic to a pinia store,
like you would usually do in a Vue application.

While using the stores in components is a non issue, after all pinia was built
for that, using them in plugins can be a bit more challenging. Indeed, pinia,
much like zoram and vue, relies on an application context being available to
enable you to write simple code without having to maintain a reference to the
application instance yourself.

::: info Trivia

In fact the way pinia implemented this behavior strongly influenced how zoram
works.

:::

To use Stores in plugins and prevent issues with missing contexts, or context
pollution if you have multiple apps running on the same page, you will need to
register your stores as services in the zoram instance. To do that it can hardly
get simpler than returning the pinia store in a service factory and registering
it in the plugin, right ?

::: code-group

```ts [awesome.store.ts]
import type { Service } from '@zoram/core';
import type { ServiceAsStore } from '@zoram-plugin/panoramique';
import { defineStore } from 'pinia';

interface MyAwesomeStore extends Service {
	/* your store public actions, getters and state goes here */
}

// create the store as usual
export const useAwesomeStore = defineStore<
	'awesome', ServiceAsStore<MyAwesomeStore>
>(/*[!hint:id:]*/'awesome', /*[!hint:setup:]*/() => {
	/* your store implementation goes here */
})
```

```ts [awesome.service.ts]
import { defineService } from '@zoram/core';
import { useAwesomeStore } from './awesome.store';

// create a service from the store
export const myAwesomeService = defineService<MyAwesomeStore>(
	/*[!hint:setup:]*/({ services }/*[!hint::app]*/) => useAwesomeStore()
);
```

```ts [awesome.plugin.ts]
import { addService, definePlugin } from '@zoram/core';
import { myAwesomeService } from './awesome.service';
import type { MyAwesomeStore } from './awesome.store';

// remember to augment the ServiceCollection
declare module '@zoram/core' {
	interface ServiceCollection {
		/**
		 * Do cool stuff with Pinia
		 */
		awesome: MyAwesomeStore;
	}
}

// register the service
export const panoramiquePlugin = definePlugin(() => {
	addService('awesome', myAwesomeService);
});
```

:::

And now you can use your store in Vue components like usual by importing and
invoking `useAwesomeStore()` and in plugins via `app.services.awesome`.
