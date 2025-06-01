import { dependsOn, onBeforeDestroy, onCreated } from '@zoram/core';
import type { Component } from 'vue';
import { panoramiquePlugin } from '../plugin';
import type { ComponentHarness } from '../service/component-definition.type';

/**
 * Register a Vue Component in panoramique when the host plugin is created and de-register the component on tear down.
 * Additionally, flag the host component as depending on panoramique's plugin.
 *
 * @param definition - the component definition to register on plugin creation
 */
export function register<component extends Component>(definition: ComponentHarness<component>): void {
	dependsOn(panoramiquePlugin.id);

	onCreated(app => {
		app.services.panoramique.register(definition);
	});
	onBeforeDestroy(app => {
		app.services.panoramique.remove(definition.id);
	});
}