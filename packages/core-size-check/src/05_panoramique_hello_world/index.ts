import { createApp, definePlugin, onCreated } from '@xoram/core';
import {
	addChild,
	defineComponentDefinition,
	panoramiquePlugin,
	register,
	rootHarness,
} from '@xoram/plugin-panoramique';
import { h, Text, type VNode } from 'vue';

createApp([
	panoramiquePlugin,
	definePlugin(() => {
		const id = 'button';

		// eslint-disable-next-line func-style
		const button = ({ text }: { text: string }): VNode => h('button', [ h(Text, text) ]);

		register(defineComponentDefinition(id, button, ({ bind, on }) => {
			bind('text', 'hello world');
			on('click', () => alert('HI!'));
		}));

		addChild(rootHarness, id);

		onCreated(app => app.services.vue.app.mount('body'));
	}),
]);
