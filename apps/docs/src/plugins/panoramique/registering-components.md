# Registering components

<!--@include: ./__start-at-beginning.md -->

Once your provided all the necessary information to you component definition you
can register it in panoramique so it can be converted into a harness, ready to
be mounted in the DOM. There is two ways of registering a definition :

- using the `register` helper : for when you don't need to control when the
  component is registered. It will register the definition when the plugin is
  created and remove it automatically when the plugin is disposed of.
- using the service's `register` method : for when you want to control when the
  definition is registered and removed.

## The `register` helper

Ideally you won't need to control when a component definition is registered, the
mounting of the component being controlled separately as we will see later on.
In this case the easiest is to register the component in the
`onCreated` hook and to remove it in the `onBeforeDestroy` hook, this is exactly
what the `register` helper do for you :

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

Note that when using the helper you don't need to use `dependsOn` to declare the
dependency on panoramique, it is done for you automatically, you can however do
it anyway for clarity or completeness if you want to.

## The service's `register` method

If you want to control when your definition is registered, for example if you
know some other harness reference the one you have to declare, but you don't
want it to always be loaded. You can register that definition manually by
interacting with the panoramique service directly, for example in an
`onEvent` listener :

```ts
import { userPlugin } from '@acme/user-managment';
import { definePlugin, dependsOn, onCreated, onEvent } from '@xoram/core';
import { panoramiquePlugin } from '@xoram/plugin-panoramique/src';
import { emailPromptDefinition as emailPrompt } from './definitions';

export default definePlugin(() => { // [!code focus:100]
	dependsOn(userPlugin);
	// remember to add panoramique as a dependency of your plugin
	dependsOn(panoramiquePlugin); // [!code highlight]

	onCreated(app => {
		onEvent(/*[!hint:target:]*/'user', /*[!hint:on:]*/'loggedIn',
			/*[!hint:handler:]*/({ user }) => {
				// if the user is logged in we already know if they want our
				// newsletter or not
				if (app.services.userService.isLoggedIn(user)) {
					return;
				}

				// register the email prompt popup so it shows in any component that
				// has it declared as a child
				// [!code highlight]
				services.panoramique.register(/*[!hint:definition:]*/emailPrompt);
			},
		);
	});
});
```