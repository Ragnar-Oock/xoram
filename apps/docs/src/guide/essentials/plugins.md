# Plugins

Plugins are the core of zoram's philosophy, they allow you to split your
application in smaller atomic pieces that you can compose to create complex yet
easy to maintain applications.

## Defining a plugin

Plugins are created by passing a `setup` function to the `definePlugin`
function, it will be invoked each time the plugin is loaded into an application
and this is where you will be able to programmatically describe what the plugin
does and what it needs.

```js
import {definePlugin} from '@zoram/core';

export default definePlugin(/* setup */ () => {
	console.log("I'm a plugin !");
})
```

::: info

The setup function is called as part of the `setup` phase of the plugin, you can
learn more about that on the [life cycles](/guide/plugins-in-depth/life-cycle)
page.

:::

## Naming your plugins

Plugins are automatically assigned a `Symbol` as it's id when you call
`definePlugin`, this id is used to resolve dependencies between plugins, but it
will also be used in error message and no one likes to debug an error on a
plugin you can't find in the source code because it has no name. To avoid that
you can provide a name that will be used as the description of the `Symbol`
id.

```js {4}
import {definePlugin} from '@zoram/core';

export default definePlugin(
	/* name */ 'my-plugin',
	/* setup */ () => {
		console.log("I'm a plugin !");
	})
```

::: info

Plugins' id are guarantied to be unique, even if you provide the same name to
multiple plugin definitions, this is done to avoid issues when using plugins
from third party libraries or when multiple teams work on the same product.

:::