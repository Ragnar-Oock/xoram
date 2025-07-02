import { definePlugin, dependsOn, onCreated } from '@xoram/core';
import { panoramiquePlugin } from '@xoram/plugin-panoramique';
import { emailPromptDefinition } from './definitions';

// [!code focus:100]
export default definePlugin(() => {
	// remember to declare the dependency
	dependsOn(panoramiquePlugin.id);

	onCreated(app => {
		// getting the id from the definition
		let harness = app.services.panoramique.get(/*[!hint:id:]*/emailPromptDefinition.id);
		// or using a magic string
		harness = app.services.panoramique.get(/*[!hint:id:]*/'email-prompt');
	});
});