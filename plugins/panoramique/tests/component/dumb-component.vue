<script setup lang="ts">
	const { prop } = defineProps<{ prop?: string }>();
</script>

<template>
	<p data-testid="lorem">Lorem ipsum dolor sit amet.</p>
	<p>{{ prop }}</p>
</template>

<style scoped>

</style>