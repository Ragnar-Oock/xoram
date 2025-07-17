import { createApp } from '@xoram/core';
import { panoramiquePlugin } from '@xoram/plugin-panoramique';
import { tiptapPlugin } from './plugins/editor/tiptap.plugin';
import { menuPlugin } from './plugins/menu/menu.plugin';
import boldPlugin from './plugins/styles/bold.plugin';
import headingPlugin from './plugins/styles/heading.plugin';
import italicPlugin from './plugins/styles/italic.plugin';
import linkPlugin from './plugins/styles/link/link.plugin';

const app = createApp([
	boldPlugin,
	italicPlugin,
	headingPlugin,
	panoramiquePlugin,
	tiptapPlugin,
	menuPlugin,
	linkPlugin,
], {
	id: 'tiptap-demo',
});

// @ts-expect-error just debug stuff
window.app = app;