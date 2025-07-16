import { createApp, definePlugin } from '@xoram/core';
import { addChild, defineComponentDefinition, panoramiquePlugin, register } from '@xoram/plugin-panoramique';
import { tiptapPlugin } from './plugins/editor/tiptap.plugin';
import EditorButton from './plugins/menu/editor-button.vue';
import { menuPlugin } from './plugins/menu/menu.plugin';

const app = createApp([
	panoramiquePlugin,
	tiptapPlugin,
	menuPlugin,

	definePlugin('addButtons', () => {
		register(defineComponentDefinition('bold', EditorButton, ({ bind }) => {
			bind('mark', 'bold');
		}));

		addChild('menu', 'bold');
	}),
], {
	id: 'tiptap-demo',
});

// @ts-expect-error just debug stuff
window.app = app;