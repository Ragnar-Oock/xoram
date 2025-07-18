import { definePlugin, dependsOn } from '@xoram/core';
import { addChild, defineComponentDefinition, register } from '@xoram/plugin-panoramique';
import EditorMenuGroup from '../menu/editor-menu-group.vue';
import { menuPlugin } from '../menu/menu.plugin';

export const StyleGroup = 'style-group';

export default definePlugin('style-group', () => {
	dependsOn(menuPlugin.id);
	register(defineComponentDefinition(StyleGroup, EditorMenuGroup));
	addChild('menu', StyleGroup);
});