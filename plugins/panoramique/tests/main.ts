// import { createApp, definePlugin, dependsOn, onCreated } from '@xoram/core';
// import { addChild, defineComponentDefinition, panoramiquePlugin, register, rootHarness } from '../src';
// import ContextMenu from './component/context-menu.vue';
// import ContextOption from './component/context-option.vue';
// import TestComponentComposition from './component/test-component-composition.vue';
//
// const menuPlugin = definePlugin('menu', () => {
// 	register({
// 		id: 'context-menu',
// 		type: ContextMenu,
// 		events: {
// 			open: [ console.log ],
// 		},
// 	});
//
// 	addChild(rootHarness, 'context-menu');
//
// 	onCreated(app => app.services.vue.app.mount('#app'));
// });
// const app = createApp([
// 	definePlugin('alert-option', () => {
// 		dependsOn(menuPlugin.id);
//
// 		register({
// 			id: 'alert',
// 			type: ContextOption,
// 			events: {
// 				click: [ (event): void => alert(event.type) ],
// 				'update:text': [ alert ],
// 			},
// 			props: {
// 				text: 'alert()',
// 			},
// 		});
//
// 		register({
// 			id: 'log',
// 			type: ContextOption,
// 			events: {
// 				click: [ (event): void => console.log('I have been clicked !', event) ],
// 			},
// 			props: {
// 				text: 'console.log()',
// 			},
// 		});
//
// 		addChild('context-menu', 'alert');
// 		addChild('context-menu', 'log');
// 	}),
//
// 	definePlugin('input', () => {
// 		register(defineComponentDefinition('input', TestComponentComposition, ({ bind, on }) => {
// 			bind('label', 'This is an input');
// 			bind('text', 'input value', 'trim');
// 			on('update:text', console.log);
// 		}));
//
// 		addChild(rootHarness, 'input');
// 	}),
// 	panoramiquePlugin,
// 	menuPlugin,
// ]);
//
// console.log(app);

// todo : add support for addChild(parentId, definition)
// todo : return id from register

import { createVaporApp } from 'vue';
import ContextMenu from './component/context-menu.vue';

createVaporApp(ContextMenu)
	.mount('#app')
;