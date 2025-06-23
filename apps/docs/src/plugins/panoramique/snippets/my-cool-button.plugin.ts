import { definePlugin } from '@xoram/core';
import { addChild, defineComponentDefinition, register, rootHarness } from '@xoram/plugin-panoramique';
import MyButton from './my-button.vue';

export const myCoolButtonPlugin = definePlugin('my-cool-button', () => {
	// create a definition
	const componentDefinition = defineComponentDefinition('my-button', MyButton, ({ bind }) => {
		bind('text', 'I\'m a button');
	});

	// register the definition in panoramique
	register(componentDefinition);

	// mount the component at the root of the app
	addChild(rootHarness, componentDefinition.id);
});