import ItalicExtension from '@tiptap/extension-italic';
import { definePlugin, dependsOn, onBeforeCreate } from '@xoram/core';
import { addChild, defineComponentDefinition, register } from '@xoram/plugin-panoramique';
import EditorButton from '../menu/editor-button.vue';
import styleGroupPlugin, { StyleGroup } from './style-group.plugin';

export default definePlugin('addButtons', () => {
	dependsOn(styleGroupPlugin.id);

	register(defineComponentDefinition('italic', EditorButton, ({ bind }) => {
		bind('mark', 'italic');
	}));

	addChild(StyleGroup, 'italic');

	onBeforeCreate(app => {
		app.services.tiptap.config.extensions?.push(ItalicExtension);
	});
});
