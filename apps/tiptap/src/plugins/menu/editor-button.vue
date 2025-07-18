<script setup lang="ts">

	import { computed } from 'vue';
	import { useTiptapStore } from '../editor/tiptap.service';

	const tiptap = useTiptapStore();

	const { mark, node } = defineProps<{
		mark?: string;
		node?: string;
	}>();

	const isDisabled = computed(() => {
		if (mark) {
			return !tiptap.editor?.can().setMark(mark);
		}
		if (node) {
			return !tiptap.editor?.can().setNode(node);
		}
		return true;
	});

	const isActive = computed(() => {
		return tiptap.editor?.isActive(mark ?? node ?? '');
	});

	function handleClick(): void {
		if (isDisabled.value) {
			return;
		}

		const chain = tiptap.editor?.chain().focus();

		if (mark) {
			chain?.toggleMark(mark);
		}
		if (node) {
			chain?.toggleNode(node, 'paragraph');
		}

		chain?.run();
	}

</script>

<template>
	<button
		type="button"
		role="menuitem"
		@click="handleClick"
		:aria-disabled="isDisabled"
		:aria-pressed="isActive">
		{{ mark ?? node ?? 'unbound' }}
	</button>
</template>

<style scoped>

</style>