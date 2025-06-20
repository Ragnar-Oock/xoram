# Creating an application

A xoram application is entirely described by the list of plugins you pass to the
`createApp` function, they will implement all of your applicative and business
logic.

That means that you can create multiple applications with a set of predefined
plugins but have complete control on what feature is available, this makes it
easy to tailor a specific application to the needs of a product, client, project
or team.

```js
import {createApp} from '@xoram/core';

createApp([/* your plugins goes here */]);
```

## Using multiple apps

An application provides a self-contained context to the plugins that defines it,
that allow you to have more than one app per environment or even to use apps
within apps. You can for example use xoram to configure
a [Tiptap](https://tiptap.dev/) editor, build
an [Astro dynamic island](https://docs.astro.build/en/concepts/islands/), create
a complete
[Progressive Web App](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/What_is_a_progressive_web_app)
or all that at once.

And because plugins are reusable you can use them across multiple applications
to avoid re-inventing the wheel over and over again.

```js
import {createApp} from '@xoram/core';
import {plugins as productPlugins} from 'my-awsome-product';
import {plugins as headerMenuPlugins} from 'website/header';
import {plugins as analiticsPlugins} from 'sales/analitics';

const product = createApp([ // [!code focus:8]
	...productPlugins,
	...analiticsPlugins
]);
const headerMenu = createApp([
	...headerMenuPlugins,
	...analiticsPlugins
]);
```

## Identifying an app

You might find yourself in situations where you have two or more application
sharing the same global context, debugging in such a case can get annoying if
you don't have a way of telling the instances apart, this can be remedied by
providing an `id` to the `createApp` function that will be shown in the dev
tools and the logs of the application.

```js
import {createApp} from '@xoram/core';

const app = createApp( // [!code focus:6]
	[ /* your plugins goes here */],
	{
		id: 'myApp' // [!code highlight]
	}
);
```