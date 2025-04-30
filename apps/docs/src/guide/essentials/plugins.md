# Plugins

Plugins are the core of Zoram's philosophy, they allow you to split your 
application in smaller atomic pieces that you can compose to create complex 
yet easy to maintain application.

## Defining a plugin

Plugins are created by passing an `id` and a `setup` function to the 
`definePlugin` function.

```js
import {definePlugin} from '@zoram/core';

export default definePlugin(/* setup */ () => {
    console.log("I'm a plugin !");
})
```

## Naming your plugins

By default, plugins are assigned a generated id when they are defined at run
time. You can however give them a personalized id to find them more easily when
you encounter an error or when using the devtools.

```js {4}
import {definePlugin} from '@zoram/core';

export default definePlugin(
    /* id */ 'my-plugin',
    /* setup */ () => {
    console.log("I'm a plugin !");
})
```