The above definition is the equivalent of the below Vue template :

```vue {5-8,10-12,17-18}
// [!code focus]
<script>
	import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

	// [!code focus:100]
	const analyticsService = {
		/* implementation left as an exercise to the reader */
	}

	const onBeforeSubmit = event => {
		/* very important stuff to do before submitting */
	}
</script>

<template>
	<NewsletterSubscriptionModal
		@focusin="analyticsService.send('newsletter-interacted')"
		@before-submit="onBeforeSubmit"
	/>
</template>
```