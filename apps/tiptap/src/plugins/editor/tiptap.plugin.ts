import { addService, definePlugin, dependsOn, onBeforeDestroy, onCreated } from '@xoram/core';
import {
	addChild,
	defineComponentDefinition,
	panoramiquePlugin,
	register,
	rootHarness,
	type StoreAsService,
} from '@xoram/plugin-panoramique';
import TiptapEditor from './tiptap-editor.vue';
import { tiptapService, type TiptapStore } from './tiptap.service';


declare module '@xoram/core' {
	interface ServiceCollection {
		tiptap: StoreAsService<TiptapStore>;
	}
}

export const tiptapPlugin = definePlugin('tiptap', () => {
	dependsOn(panoramiquePlugin.id);
	addService('tiptap', tiptapService);
	register(defineComponentDefinition('tiptap', TiptapEditor));
	addChild(rootHarness, 'tiptap');

	onCreated(({ services }) => {
		services.tiptap.ready();
		services.tiptap.editor?.commands?.setContent(document.body.innerHTML);
		services.vue.app.mount('body');
	});

	onBeforeDestroy(({ services }) => {
		services.tiptap.destroy();
	});
});