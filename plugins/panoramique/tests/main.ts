import { createApp, definePlugin, dependsOn, onCreated } from '@zoram/core';
import { addChild } from '../src/helper/add-child';
import { defineComponentDefinition } from '../src/helper/define-component-definition';
import { register } from '../src/helper/register';
import { panoramiquePlugin } from '../src/plugin';
import ContextMenu from './component/ContextMenu.vue';
import ContextOption from './component/ContextOption.vue';
import TestComponentComposition from './component/TestComponentComposition.vue';

const menuPlugin = definePlugin('menu', () => {
	register({
		id: 'context-menu',
		type: ContextMenu,
		events: {
			open: [ console.log ],
		},
	});

	addChild('root', 'context-menu');

	onCreated(app => app.services.vue.app.mount(document.body));
});
const app = createApp([
	definePlugin('alert-option', () => {
		dependsOn(menuPlugin.id);

		register({
			id: 'alert',
			type: ContextOption,
			events: {
				click: [ (event): void => alert(event.type) ],
				'update:text': [ alert ],
			},
			props: {
				text: 'alert()',
			},
		});

		register({
			id: 'log',
			type: ContextOption,
			events: {
				click: [ (event): void => console.log('I have been clicked !', event) ],
			},
			props: {
				text: 'console.log()',
			},
		});

		addChild('context-menu', 'alert');
		addChild('context-menu', 'log');
	}),

	definePlugin('input', () => {
		register(defineComponentDefinition('input', TestComponentComposition, ({ bind, on }) => {
			bind('label', 'This is an input');
			bind('text', 'input value', 'trim');
			on('update:text', console.log);
		}));

		addChild('root', 'input');
	}),
	panoramiquePlugin,
	menuPlugin,
]);

console.log(app);

// todo : add support for addChild(parentId, definition)
// todo : return id from register