import type { EditorOptions } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { Editor } from '@tiptap/vue-3';
import { defineService } from '@xoram/core';
import type { StoreAsService } from '@xoram/plugin-panoramique';
import { defineStore } from 'pinia';
import { computed, type Ref, ref, type ShallowRef, shallowRef } from 'vue';

export interface TiptapStore {
	config: Ref<Partial<EditorOptions>>;
	editor: ShallowRef<Editor | undefined>;

	ready(): void;

	destroy(): void;
}

export const useTiptapStore = defineStore<'tiptap', TiptapStore>('tiptap', () => {
	const config = ref<Partial<EditorOptions>>({
		extensions: [
			StarterKit,
		],
		editorProps: {
			attributes: {
				id: 'unique-id',
				'aria-multiline': 'true',
				role: 'textbox',
				'aria-labelledby': 'label-id',
			},
		},
	});
	const editor = shallowRef<Editor | undefined>();
	return {
		config,
		editor: computed(() => editor.value),
		ready: (): void => {
			editor.value = new Editor(config.value);
		},
		destroy: (): void => {
			editor.value?.destroy();
		},
	};
});

export const tiptapService = defineService<Record<string, unknown>, StoreAsService<TiptapStore>>(() => useTiptapStore());