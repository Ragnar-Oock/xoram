```vue
// [!code focus]
<script>
	import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';
	import ChildInDefaultSlot from './ChildInDefaultSlot.vue';
	import ChildInNamedSlot from './ChildInNamedSlot.vue';
	// [!code focus:100]
</script>

<template>
	<NewsletterSubscriptionModal>
		<template> <!--[!code highlight:6]-->
			<ChildInDefaultSlot/>
		</template>
		<template #footer>
			<ChildInNamedSlot/>
		</template>
	</NewsletterSubscriptionModal>
</template>
```