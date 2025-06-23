# Registering components

<!--@include: ./__start-at-beginning.md -->

Once you have your component definitions ready all you have to do to is to
register them in panoramique, you can do so in 2 ways depending on when you want
your component to be registered :

- the `register` helper : for when you want the component available as soon as
  possible. It will register the definition when the plugin is created and
  remove it automatically when the plugin is disposed of.
- the service's `register` method : for when you want to control when the
  definition is registered.

## The `register` helper

In most cases you won't care about when the component is registered in
panoramique, you just want it to be available for other plugins to use, or you
want it registered as soon as possible so you can use it in the same plugin.

If all you do in your component is use helpers provided by panoramique you don't
have to declare the dependency, it's done automatically for you so you don't
have to clutter your plugin setup function with it.

```ts
import { definePlugin } from '@xoram/core';
import { defineComponentDefinition, register } from '@xoram/plugin-panoramique';
import { emailPromptDefinition } from './definitions';
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

export default definePlugin(() => { // [!code focus:100]

	// import the definition from elsewhere
	register(/* [!hint: definition:] */emailPromptDefinition);

	// inline definition
	register(/* [!hint: definition:] */defineComponentDefinition(
		/* [!hint: id:] */'email-prompt',
		/* [!hint: component:] */NewsletterSubscriptionModal,
		/* [!hint: setup:] */context => {
			/* bind props, set listeners and add children as you need */
		}
	))
})
```

## The service's `register` method

If you want to control when your definition is registered, for example if you
know some other harness reference the one you have to declare, but you don't
want it to always be loaded. You can register that definition when you want by
interacting with the panoramique service directly, for example in an
`onEvent` listener :

<<< ./snippets/service-register-usage.ts