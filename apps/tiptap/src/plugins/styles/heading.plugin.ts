import type { Editor } from '@tiptap/core';
import HeadingExtension, { type Level } from '@tiptap/extension-heading';
import { definePlugin, dependsOn, onBeforeCreate, onCreated } from '@xoram/core';
import { addChild, defineComponentDefinition, register } from '@xoram/plugin-panoramique';
import { ref, watch } from 'vue';
import { tiptapPlugin } from '../editor/tiptap.plugin';
import EditorSelect from '../menu/editor-select.vue';
import { menuPlugin } from '../menu/menu.plugin';

type HeadingOrParagraph = Level | 0;

function getActiveLevel(editor: Editor): HeadingOrParagraph {
	switch (true) {
		case editor.isActive('heading', { level: 1 }): { return 1; }
		case editor.isActive('heading', { level: 2 }): { return 2; }
		case editor.isActive('heading', { level: 3 }): { return 3; }
		default: { return 0; }
	}
}

export default definePlugin('heading', () => {
	// region setup

	dependsOn(tiptapPlugin.id);
	dependsOn(menuPlugin.id);

	onBeforeCreate(app => {
		app.services.tiptap.config.extensions?.push(HeadingExtension);
	});

	// endregion

	// region heading level tracking and update

	const headingLevel = ref<HeadingOrParagraph>(0);

	onCreated(app => {
		const editor: Editor | undefined = app.services.tiptap.editor;

		watch(headingLevel, (level) => {
			if (editor === undefined || level === getActiveLevel(editor)) {
				return;
			}
			if (level === 0) {
				editor
					?.chain()
					.focus()
					.setParagraph()
					.run();
				return;
			}
			editor
				?.chain()
				.focus()
				.toggleHeading({ level })
				.run();
		});
		editor?.on('selectionUpdate', ({ editor }) => {
			headingLevel.value = getActiveLevel(editor);
		});
	});

	// endregion


	// setup vue component

	addChild('menu', 'headingSelect');
	register(defineComponentDefinition(
		'headingSelect',
		EditorSelect,
		({ bind }) => {
			bind('active', headingLevel);
			bind('options', [
				{ value: 0, displayName: 'Paragraph' },
				{ value: 1, displayName: 'Title 1' },
				{ value: 2, displayName: 'Title 2' },
				{ value: 3, displayName: 'Title 3' },
			]);
		},
	));

	// endregion
});