import ItalicExtension from '@tiptap/extension-italic';
import { definePlugin, dependsOn, onBeforeCreate } from '@xoram/core';
import { addChild, defineComponentDefinition, register } from '@xoram/plugin-panoramique';
import EditorButton from '../menu/editor-button.vue';
import { menuPlugin } from '../menu/menu.plugin';

export default definePlugin('addButtons', () => {
	dependsOn(menuPlugin.id);

	register(defineComponentDefinition('italic', EditorButton, ({ bind }) => {
		bind('mark', 'italic');
	}));

	addChild('menu', 'italic');

	onBeforeCreate(app => {
		app.services.tiptap.config.extensions?.push(ItalicExtension);
	});
});
