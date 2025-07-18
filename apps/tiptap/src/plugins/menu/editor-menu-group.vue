<script setup lang="ts">
	const { label } = defineProps<{
		label?: string;
	}>();
</script>

<template>
	<div role="group" :aria-label="label">
		<slot></slot>
	</div>
</template>

<style scoped>
    [role="group"] {
        display: flex;
        gap: 2px;
    }
</style>