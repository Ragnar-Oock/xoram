import { definePlugin, dependsOn, onCreated } from '@xoram/core';
import { panoramiquePlugin } from '@xoram/plugin-panoramique';
import { emailPromptDefinition } from './definitions';

// [!code focus:100]
export default definePlugin(() => {
	// remember to declare the dependency
	dependsOn(panoramiquePlugin.id);

	onCreated(app => {
		// getting the id from the definition
		const harness = app.services.panoramique.get(/*[!hint:id:]*/emailPromptDefinition.id).value;
		// make sure the harness is available // [!code highlight:4]
		if (harness === undefined) { return; }

		harness.props.isVisible = true;
	});
});