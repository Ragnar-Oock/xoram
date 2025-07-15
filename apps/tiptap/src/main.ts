import { createApp } from '@xoram/core';
import { panoramiquePlugin } from '@xoram/plugin-panoramique';
import { tiptapPlugin } from './plugins/editor/tiptap.plugin';

const app = createApp([
	panoramiquePlugin,
	tiptapPlugin,
], {
	id: 'tiptap-demo',
});


console.log(app);