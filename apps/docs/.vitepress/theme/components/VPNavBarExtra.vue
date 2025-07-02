<script lang="ts" setup>
	import { useData } from 'vitepress';
	import VPFlyout from 'vitepress/dist/client/theme-default/components/VPFlyout.vue';
	import VPSocialLinks from 'vitepress/dist/client/theme-default/components/VPSocialLinks.vue';
	import VPSwitchAppearance from 'vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue';
	import type { DefaultTheme } from 'vitepress/theme';
	import { computed } from 'vue';
	import SwitchInlayHints from './SwitchInlayHints.vue';

	const { site, theme } = useData<DefaultTheme.Config>();

	const showThemeSwitch = computed(() =>
		site.value.appearance &&
		site.value.appearance !== 'force-dark' &&
		site.value.appearance !== 'force-auto',
	);
</script>

<template>
	<VPFlyout
		class="VPNavBarExtra"
		label="extra navigation"
	>
		<div
			class="group"
		>
			<div
				class="item appearance"
				v-if="showThemeSwitch">
				<p class="label">
					{{ theme.darkModeSwitchLabel || 'Appearance' }}
				</p>
				<div class="appearance-action">
					<VPSwitchAppearance/>
				</div>
			</div>
			<div class="item appearance">
				<p class="label">
					{{ 'Inlay Hints' }}
				</p>
				<div class="appearance-action">
					<SwitchInlayHints/>
				</div>
			</div>
		</div>

		<div v-if="theme.socialLinks" class="group">
			<div class="item social-links">
				<VPSocialLinks class="social-links-list" :links="theme.socialLinks"/>
			</div>
		</div>
	</VPFlyout>
</template>

<style scoped>
	.VPNavBarExtra {
		display: none;
		margin-right: -12px;
	}

	@media (min-width: 768px) {
		.VPNavBarExtra {
			display: block;
		}
	}

	@media (min-width: 1280px) {
		.VPNavBarExtra {
			display: none;
		}
	}

	.item.appearance,
	.item.social-links {
		display: flex;
		align-items: center;
		padding: 0 12px;
	}

	.item.appearance {
		min-width: 176px;
	}

	.appearance-action {
		margin-right: -2px;
	}

	.social-links-list {
		margin: -4px -8px;
	}
</style>