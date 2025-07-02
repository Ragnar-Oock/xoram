<script setup lang="ts">
	import { useTemplateRef, watchEffect } from 'vue';

	const { isVisible = false } = defineProps<{ isVisible?: boolean }>();

	const popover = useTemplateRef<HTMLDivElement>('popover');

	watchEffect(() => {
		if (isVisible) { popover.value?.showPopover(); }
	});
</script>

<template>
	<div class="popup" popover ref="popover">
		<slot></slot>
	</div>
</template>
