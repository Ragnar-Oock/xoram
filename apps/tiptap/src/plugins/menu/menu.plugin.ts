import { definePlugin, dependsOn } from '@xoram/core';
import { addChild, defineComponentDefinition, register } from '@xoram/plugin-panoramique';
import { tiptapPlugin } from '../editor/tiptap.plugin';
import EditorMenu from './editor-menu.vue';

export const menuPlugin = definePlugin('menu', () => {
	register(
		defineComponentDefinition('menu', EditorMenu),
	);
	addChild('tiptap', 'menu');

	// because we want to use useTiptap in our components
	dependsOn(tiptapPlugin.id);
});