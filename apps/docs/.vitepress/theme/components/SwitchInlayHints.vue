<script lang="ts" setup>
	import { useStorage } from '@vueuse/core';
	import VPSwitch from 'vitepress/dist/client/theme-default/components/VPSwitch.vue';
	import { ref, watchPostEffect } from 'vue';

	const showInlayHint = useStorage('vitepress-show-inlay-hint', true);

	function toggleAppearance(): void {
		showInlayHint.value = !showInlayHint.value;
	}

	const switchTitle = ref('');

	watchPostEffect(() => {
		document.documentElement.classList.toggle('show-inlay-hint', showInlayHint.value);
		switchTitle.value = showInlayHint.value
			? 'Disable Inlay Hints'
			: 'Enable Inlay Hints';
	});
</script>

<template>
	<VPSwitch
		:title="switchTitle"
		class="VPSwitchAppearance switchInlayHint"
		:aria-checked="showInlayHint"
		@click="toggleAppearance"
	>
		<span class="vpi-inlay-on on"/>
		<span class="vpi-inlay-off off"/>
	</VPSwitch>
</template>

<style scoped lang="scss">

  .vpi-inlay {
    &-on {
      opacity: 1;
      --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-code' viewBox='0 0 16 16'%3E%3Cpath d='M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8z'/%3E%3C/svg%3E");
    }

    &-off {
      opacity: 0;
      --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-code-slash' viewBox='0 0 16 16'%3E%3Cpath d='M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0'/%3E%3C/svg%3E");
    }
  }

  .show-inlay-hint .vpi-inlay-on {
    opacity: 0;
  }

  .show-inlay-hint .vpi-inlay-off {
    opacity: 1;
  }

  .show-inlay-hint .VPSwitchAppearance :deep(.check) {
    transform: translateX(18px);
  }
</style>
