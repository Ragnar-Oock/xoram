# Updating a component's props

There is two situations where you might need to update a component's prop : from
the plugin that registered the component or from another plugin. Both situations
are valid use cases, but they require different mechanisms.

## Updating a prop from the same plugin

When the plugin that uses a component is the same one as the one registering it
you can set up the reactivity directly in the definition, this way your code is
more declarative and descriptive, which will make it easier to understand and
reason about later on.

We saw previously that definitions are static, modifying them after the fact
will not update the resulting harness or mounted component. We also saw in
[Describing components: Passing props](./describing-components#passing-props)
that we can bind reactive values in props like we would do in a normal Vue
component.

We might want to pre-fill the email field with the email address registered on
the user's account when they log in :

::: code-group

```ts [setup style]
import { definePlugin } from '@xoram/core';
import { defineComponentDefinition, register } from '@xoram/plugin-panoramique';
import { ref } from 'vue';
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

// [!code focus:100]
export default definePlugin(/*[!hint:setup:]*/() => {
	const email = ref(/*[!hint:value:]*/'');

	register(/*[!hint:definition:]*/defineComponentDefinition(
		/*[!hint:id:]*/'email-prompt',
		/*[!hint:type:]*/NewsletterSubscriptionModal,
		/*[!hint:setup:]*/({ bind }) => {
			bind('email', email);
		},
	));

	// initialize the email when the user logs in
	onEvent(
		/*[!hint:target:]*/'user',
		/*[!hint:on:]*/'loggedIn',
		/*[!hint:handler:]*/({ user }) => { email.value = user.email;}
	);
});
```

```ts [option stype]
import { definePlugin, onEvent } from '@xoram/core';
import { register } from '@xoram/plugin-panoramique';
import { ref } from 'vue';
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

// [!code focus:100]
export default definePlugin(/*[!hint:setup:]*/() => {
	const email = ref(/*[!hint:value:]*/'');

	register(/*[!hint:definition:]*/{
		id: 'email-prompt',
		type: NewsletterSubscriptionModal,
		props: { email },
	})

	// initialize the email when the user logs in
	onEvent(
		/*[!hint:target:]*/'user',
		/*[!hint:on:]*/'loggedIn',
		/*[!hint:handler:]*/({ user }) => { email.value = user.email;}
	);
})
```

:::

Because `email` is set as a model in `NewsletterSubscriptionModal`, any changes
to the value done by the user (or any other part of the application) would also
be applied to the `email` ref bound to the prop. This allows you to use Vue's
reactivity in your plugin's code to implement more complex behaviors.

## Updating a prop from another plugin

Using reactive values as props is only possible if the plugin that uses the
component is also the one registering it. In some situations you might have to
update a component's prop from another plugin, for example if multiple plugins
need to open the same modal. In those cases you will need to update the harness
value directly by overriding the existing value with another one.

To edit a harness you need to have access to it, this is done via the service's
`get` method, which will return a computed holding the harness corresponding to
the given id :

<<< ./snippets/get-method-example.ts

If you provide an id that doesn't correspond to an existing harness `get`
will return a computed holding undefined. This computed will be updated with the
corresponding harness if one is registered later.

Harnesses are reactive object, an update to their properties will be applied to
any corresponding mounted component. If we have a simple popup component that
becomes visible when a `isVisible` prop is set to `true` :

<<< ./snippets/popup.vue

We can toggle it on by simply binding a new value is the corresponding prop :

<<< ./snippets/set-harness-prop.ts
