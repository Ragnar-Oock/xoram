<script setup lang="ts">
	import { computed, ref, useId, useTemplateRef } from 'vue';
	import { useTiptapStore } from '../../editor/tiptap.service';

	const tiptap = useTiptapStore();

	const isLink = computed(() => tiptap.editor && tiptap.editor.isActive('link'));
	const buttonFace = computed(() => isLink.value ? 'Update link' : 'Add link');

	// region link form popup

	const popup = useTemplateRef<HTMLFormElement>('popup');

	function applyLink(): void {
		tiptap.editor?.chain()
			.focus()
			.setLink({ href: url.value, target: '_blank' })
			.run();
		popup.value?.togglePopover(false);
	}

	const url = ref('');
	const urlInputId = useId();
	const popoverId = useId();

	// endregion

	// region other actions

	function removeLink(): void {
		tiptap.editor?.chain()
			.focus()
			.unsetLink()
			.run();
	}

	// function followLink(): void {
	// 	const editor = tiptap.editor;
	// 	if (!editor) {
	// 		return;
	// 	}
	// 	editor.commands.focus();
	// 	const selection = editor.state?.selection;
	// 	if (!selection) {
	// 		return;
	// 	}
	// 	const pos = new NodePos(selection.$from, editor);
	// 	const link = pos.querySelector('link');
	// 	console.log(pos);
	// }

	// endregion

</script>

<template>
	<div role="group">
		<button
			role="menuitem"
			type="button"
			ref="setLink"
			:popovertarget="popoverId"
			popovertargetaction="show"
		>{{ buttonFace }}
		</button>
		<button
			role="menuitem"
			type="button"
			v-if="isLink"
			@click="removeLink"
		>Remove link
		</button>
		<!--		<button-->
		<!--			role="menuitem"-->
		<!--			type="button"-->
		<!--			v-if="isLink"-->
		<!--			@click="followLink"-->
		<!--		>Open link-->
		<!--		</button>-->
	</div>

	<form
		popover
		ref="popup"
		@submit.prevent="applyLink"
		:id="popoverId"
	>
		<label :for="urlInputId">URL :</label>
		<input
			type="url"
			name="url"
			:id="urlInputId"
			autofocus
			placeholder="https://xoram.dev/"
			v-model="url">
		<button
			type="submit"
		>{{ buttonFace }}
		</button>
	</form>

</template>

<style scoped>

</style>