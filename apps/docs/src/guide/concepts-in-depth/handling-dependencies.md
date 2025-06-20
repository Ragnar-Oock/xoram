# Handling plugin dependencies

Because plugins are supposed to be atomic you need a way to combine them to
create more complex logic in your application. This is made possible via a
robust dependency system managed by the xoram instance.

## Declaring dependencies

Declaring a dependency of a plugin over another is done by passing the id of the
plugin you depend on to the `dependsOn` function.

```js {6}
import {definePlugin, dependsOn} from '@xoram/core';

export const myPlugin = definePlugin(() => { // [!code focus:9]
	console.log("I'm a plugin !");

	dependsOn(myOtherPlugin.id)
});

export const myOtherPlugin = definePlugin(() => {
	/** do some important stuff here */
})
```

By declaring your dependency you have instructed the application to create
`myPlugin` after `myOtherPlugin`. Once the setup phase is over, all hooks of the
registered plugins will be invoked respecting that dependency relationship.

## Using plugin ids

Because xoram uses symbols internally to discriminate plugins you won't be able
to pass the string you've used in `definePlugin` when calling `dependsOn`. You
will need to use the plugin definition (returned by `definePlugin`) of your
dependency.

You might think it's annoying or bad DX, but it is actually at your advantage.
When you declare a dependency on another plugin it's because you need that
plugin to add something in the app for you to use, usually it is a service. In
such a case having an import to the module that defines the plugin has multiple
benefits :

- **id unity** : because the id is a `symbol` it is unique across the whole
  global context, so there is no possibility of id collision if another plugin
  in the application happens to be named the same (thought it should still be
  avoided for clarity)
- **typescript** : because you have an import pointing to the module that
  defined your dependency, typescript is able to infer the type of any service
  that this plugin might have registered in the application, making it possible
  to validate types of methods or events of that service
- **package dependencies** : in the case that the plugin you depend on comes
  from another package (be it because it comes from a lib you are using or
  because you work in a monorepo setup) your build pipeline can make sure that
  the plugin you request is actually installed for your package

## Beware of transitive dependency

A transitive dependency occurs when a plugin depends on another plugin
indirectly, through a chain of dependencies. This is something you will
encounter as soon as you have a chain of dependency longer than two plugins. But
why can this be bad ?

Suppose we have:

- `AuthPlugin` → depends on `LoggerPlugin`
- `LoggerPlugin` → depends on `CoreUtilsPlugin`

When loading the plugins in the application their dependency will be analysed,
and they will be loaded in an order that will satisfy the dependencies.
`CoreUtilsPlugin` will be loaded first, then `LoggerPlugin` and finally
`AuthPlugin`.

_So? Where is the issue ?_

As is there is no issue, but you might have to make a modification to
`LoggerPlugin` down the line and replace `CoreUtilsPlugin` with another plugin
or remove it entirely. This is when you might see strange errors in
`AuthPlugin`.

Because until now all the services and logic provided by `CoreUtilsPlugin` was
always loaded before `AuthPlugin` you might have used some of it without
declaring a dependency to it and now your app is broken.

_So what do we do ?_

When using services from other plugins, make sure you have a direct dependency
to that plugin, here you would need to add a dependency from `AuthPlugin` to
`LoggerPlugin` if you use some of its logic, leading to :

- `AuthPlugin` → depends on `LoggerPlugin` and `CoreUtilsPlugin`
- `LoggerPlugin` → depends on `CoreUtilsPlugin`
