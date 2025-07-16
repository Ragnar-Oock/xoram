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

## Using stores in plugins

When you need to interact a lot with complex components or groups of components
in a plugin it might be interesting to move some of the logic to a pinia store,
like you would usually do in a Vue application.

While using those stores in components is no different from using them in a
classic Vue application, using them in plugins is a bit more challenging; if you
simply try to invoke `useMyStore()` in plugin code you might get unreliable
results depending on how the code you wrote is invoked. This is caused by the
way pinia, like vue and xoram, maintain an application state without you needing
to pass an application instance around. In fact the way pinia implemented this
behavior strongly influenced how xoram works.

To make sure your stores are always available and usable no matter how your code
is invoked you will need to register them as services in the xoram application
by passing them through `defineService()` :

::: code-group

```ts [blog.plugin.ts]
import { addService, definePlugin, defineService } from '@xoram/core';
import type { StoreAsService } from '@xoram/plugin-panoramique';
import type { BlogStore } from './blog.store';
import { useBlogStore } from './blog.store';

// remember to augment the ServiceCollection  // [!code focus:100]
declare module '@xoram/core' {
	interface ServiceCollection {
		/* Manage Blog posts */
		blog: StoreAsService<BlogStore>;
	}
}

// register the service
export const blogPlugin = definePlugin(() => {
	addService(
		/*[!hint:id:]*/'blog',
		/*[!hint:serviceFactory:]*/defineService(
			/*[!hint:setup:]*/() => useBlogStore()
		)
	)
	;
});
```

```ts [blog.store.ts]
import { defineStore } from 'pinia';
import type { ComputedGetter } from 'vue';
import { computed } from 'vue';

export interface Post { // [!code focus:100]
	title: string,
	content: string,
	banner?: URL,
}

export interface BlogStore {
	posts: ComputedGetter<Post[]>;
}

// create the store as usual
export const useBlogStore = defineStore<'blog', BlogStore>(
	/*[!hint:id:]*/'blog',
	/*[!hint:setup:]*/() => ({
		posts: computed<Post[]>(() => { /* aquire the posts */ })
	})
);
```

:::

And now you can use the blog store in Vue components like usual by importing and
invoking `useBlogStore()` and in plugins via `app.services.blog`.
