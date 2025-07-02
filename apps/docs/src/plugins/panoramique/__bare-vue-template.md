The above definition is equivalent to using our component in a Vue template
without passing any prop, event or content :

```vue
// [!code focus]
<script>
	import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';
	// [!code focus:100]
</script>

<template>
	<NewsletterSubscriptionModal/>
</template>
```
