<script setup lang="ts">
	/** the text shown on the button */
	const { text = 'button' } = defineProps<{ text?: string }>();
</script>

<template>
	<button role="menuitem">
		{{ text }}
	</button>
</template>
