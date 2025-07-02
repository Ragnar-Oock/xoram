<script lang="ts" setup>
	import VPSwitchAppearance from 'vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue';
	import SwitchInlayHints from './SwitchInlayHints.vue';
</script>

<template>
	<div
		class="VPNavBarAppearance"
	>
		<VPSwitchAppearance/>
		<SwitchInlayHints/>
	</div>
</template>

<style scoped>
	.VPNavBarAppearance {
		display: none;

		&&&:before {
			margin-right: 4px
		}
	}

	@media (min-width: 1280px) {
		.VPNavBarAppearance {
			display: flex;
			align-items: center;
			gap: 1em;
		}
	}
</style>
