import { definePlugin, dependsOn, onCreated, onEvent } from '@xoram/core';
import { panoramiquePlugin } from '@xoram/plugin-panoramique';
import { emailPromptDefinition } from './definitions';

// [!code focus:200]
export default definePlugin(() => {
	// remember to declare the dependency
	dependsOn(panoramiquePlugin.id);

	onCreated(app => {
		onEvent(/*[!hint:target:]*/'button', /*[!hint:on:]*/'clicked', /*[!hint:handler:]*/() => {
				app.services.panoramique.removeChild(
					/*[!hint: parent:]*/'modal-container',
					/*[!hint: child:]*/emailPromptDefinition.id,
				);
			},
		);
	});
});