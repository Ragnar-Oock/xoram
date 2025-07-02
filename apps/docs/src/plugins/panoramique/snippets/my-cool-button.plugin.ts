import { definePlugin } from '@xoram/core';
import { addChild, defineComponentDefinition, register, rootHarness } from '@xoram/plugin-panoramique';
import MyButton from './my-button.vue';

export const myCoolButtonPlugin = definePlugin('my-cool-button', () => {
	// create a definition
	const componentDefinition = defineComponentDefinition(
		/*[!hint:id:]*/'my-button',
		/*[!hint:component:]*/MyButton,
		/*[!hint:setup:]*/({ bind }) => {
			bind('text', 'I\'m a button');
		},
	);

	// register the definition in panoramique
	register(/*[!hint:definition:]*/componentDefinition);

	// mount the component at the root of the app
	addChild(/*[!hint:parent:]*/rootHarness, /*[!hint:child:]*/componentDefinition.id);
});