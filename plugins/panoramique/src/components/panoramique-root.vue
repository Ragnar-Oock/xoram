<script lang="ts" setup>
	/**
	 * PanoramiqueRoot
	 *
	 * This component is used as the root component of a Vue app built with `@zoram-plugin/panoramique` it will mount all
	 * the {@link ComponentDefinition} registered as children of `'root'`.
	 */
	import { computed } from 'vue';
	import { usePanoramiqueStore } from '../services/panoramique.service';
	import PanoramiquePlatform from './panoramique-platform.vue';


	const harness = usePanoramiqueStore().get('root');
	const children = computed(() => harness.value?.children.default ?? []);
</script>

<template>
	<PanoramiquePlatform
		v-for="child in children"
		:identifier="child"
		:key="child"
	/>
</template>

<style scoped>

</style>