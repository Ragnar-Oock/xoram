import BoldExtension from '@tiptap/extension-bold';
import { definePlugin, dependsOn, onBeforeCreate } from '@xoram/core';
import { addChild, defineComponentDefinition, register } from '@xoram/plugin-panoramique';
import EditorButton from '../menu/editor-button.vue';
import { menuPlugin } from '../menu/menu.plugin';

export default definePlugin('addButtons', () => {
	dependsOn(menuPlugin.id);

	register(defineComponentDefinition('bold', EditorButton, ({ bind }) => {
		bind('mark', 'bold');
	}));

	addChild('menu', 'bold');

	onBeforeCreate(app => {
		app.services.tiptap.config.extensions?.push(BoldExtension);
	});
});
