<script setup lang="ts">
	import { computed, ref, useId, useTemplateRef } from 'vue';
	import { useTiptapStore } from '../../editor/tiptap.service';
	import EditorMenuGroup from '../../menu/editor-menu-group.vue';

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
	<editor-menu-group>
		<button
			role="menuitem"
			type="button"
			ref="setLink"
			:popovertarget="popoverId"
			popovertargetaction="show"
			class="rounded"
		>{{ buttonFace }}
		</button>
		<button
			role="menuitem"
			type="button"
			v-if="isLink"
			@click="removeLink"
			class="rounded"
		>Remove link
		</button>
		<!--		<button-->
		<!--			role="menuitem"-->
		<!--			type="button"-->
		<!--			v-if="isLink"-->
		<!--			@click="followLink"-->
		<!--		>Open link-->
		<!--		</button>-->
	</editor-menu-group>

	<form
		popover
		ref="popup"
		@submit.prevent="applyLink"
		:id="popoverId"
	>
		<fieldset>
			<label :for="urlInputId"
			       class="rounded"><span>URL :</span></label>
			<input
				type="url"
				name="url"
				:id="urlInputId"
				autofocus
				placeholder="https://xoram.dev/"
				v-model="url"
				class="rounded"
			>
			<button
				type="submit"
				class="btn rounded"
			>{{ buttonFace }}
			</button>
		</fieldset>
	</form>

</template>

<style scoped>
    [popover] {
        border: none;
        padding: 1em;
        border-radius: var(--b-radius);

        box-shadow: 0 0 15px var(--primary-0);
    }

    fieldset {
        display: flex;
        padding: .5em;
        align-items: center;
        border: 1px solid var(--secondary-4);
        border-radius: var(--b-radius);
    }
</style>