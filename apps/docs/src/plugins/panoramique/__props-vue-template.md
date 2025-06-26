The above definition is the equivalent of the below Vue template :

```vue {5,11-12}
// [!code focus]
<script>
	import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

	// [!code focus:100]
	const email = ref('');
</script>

<template>
	<NewsletterSubscriptionModal
		label="The email address to subscribe with"
		:email.lazy.trim="email"
	/>
</template>
```