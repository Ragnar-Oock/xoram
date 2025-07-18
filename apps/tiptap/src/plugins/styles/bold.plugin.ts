import BoldExtension from '@tiptap/extension-bold';
import { definePlugin, dependsOn, onBeforeCreate } from '@xoram/core';
import { addChild, defineComponentDefinition, register } from '@xoram/plugin-panoramique';
import EditorButton from '../menu/editor-button.vue';
import styleGroupPlugin, { StyleGroup } from './style-group.plugin';

export default definePlugin('addButtons', () => {
	dependsOn(styleGroupPlugin.id);

	register(defineComponentDefinition('bold', EditorButton, ({ bind }) => {
		bind('mark', 'bold');
	}));

	addChild(StyleGroup, 'bold');

	onBeforeCreate(app => {
		app.services.tiptap.config.extensions?.push(BoldExtension);
	});
});
