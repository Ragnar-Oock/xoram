# Plugins

Plugins are the core of Zoram's philosophy, they allow you to split your 
application in smaller atomic pieces that you can compose to create complex 
yet easy to maintain application.

## Defining a plugin

Plugins are created by passing an `id` and a `setup` function to the 
`definePlugin` function.

```js
import {definePlugin} from '@zoram/core';

export default definePlugin('myPlugin', () => {
    console.log("I'm a plugin !");
})
```

## Declaring dependencies

Because plugins are supposed to be atomic you need a way to combine them to 
create more complex logic in your application. This is made possible via a
robust dependency system managed by the Zoram instance.

Declaring a dependency of a plugin over another is done by passing the id of 
the plugin you depend on to the `dependsOn` function.

```js
import {definePlugin, dependsOn} from '@zoram/core';


export const myPlugin = definePlugin('myPlugin', () => {
    console.log("I'm a plugin !");
    
    dependsOn('myOtherPlugin')
});

export const myOtherPlugin = definePlugin('myOtherPlugin', () => {
    /** do some important stuff here */
})
```

By declaring your dependency you have instructed the application to create 
`myPlugin` after `myOtherPlugin`. Once the setup phase is over, all hooks of 
the registered plugins will be invoked respecting that dependency relationship.


::: tip
You can learn more about the implication of dependencies on hooks with the 
[plugin life cycle page](../plugins-in-depth/life-cycle).
:::
