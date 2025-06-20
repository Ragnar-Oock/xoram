<script lang="ts" setup>
	/**
	 * PanoramiqueRoot
	 *
	 * This component is used as the root component of a Vue app built with `@xoram/plugin-panoramique` it will mount all
	 * the {@link ComponentHarness} registered as children of `rootHarness`.
	 */
	import { computed } from 'vue';
	import { rootHarness, usePanoramiqueStore } from '../service/panoramique.service';
	import PanoramiquePlatform from './panoramique-platform.vue';


	const harness = usePanoramiqueStore().get(rootHarness);
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