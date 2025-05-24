import { dependsOn, onBeforeDestroy, onCreated } from '@zoram/core';
import type { Component } from 'vue';
import type { ComponentSlots } from 'vue-component-type-helpers';
import { panoramiquePlugin } from '../plugin';

// TODO: usability check
// TODO: tests ?

/**
 * Register a component as the child of another when the host plugin is created and sever the link on teardown.
 * Additionally, flag the host component as depending on panoramique's plugin.
 *
 * @param parent - id of the parent component to register the child into
 * @param child - id of the child component
 * @param slot - name of the slot to add the child into, defaults to the `default` slot if left empty
 */
export function addChild<parent extends Component = Component>(
	parent: string,
	child: string,
	slot?: keyof ComponentSlots<parent> & string,
): void {
	dependsOn(panoramiquePlugin.id);

	onCreated(app => {
		app.services.panoramique.addChild(parent, child, slot);
	});
	onBeforeDestroy(app => {
		app.services.panoramique.removeChild(parent, child, slot);
	});
}