import LinkExtension from '@tiptap/extension-link';
import { definePlugin, dependsOn, onBeforeCreate } from '@xoram/core';
import { addChild, defineComponentDefinition, register } from '@xoram/plugin-panoramique';
import { tiptapPlugin } from '../../editor/tiptap.plugin';
import { menuPlugin } from '../../menu/menu.plugin';
import LinkForm from './link-form.vue';


export default definePlugin('link', () => {
	dependsOn(menuPlugin.id);
	dependsOn(tiptapPlugin.id);
	register(defineComponentDefinition('link', LinkForm));
	addChild('menu', 'link');

	onBeforeCreate(app => {
		app.services.tiptap.config.extensions?.push(LinkExtension.configure({
			openOnClick: false,
		}));
	});
});