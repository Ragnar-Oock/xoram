import { userPlugin } from '@acme/user-managment';
import { definePlugin, dependsOn, onCreated, onEvent } from '@xoram/core';
import { panoramiquePlugin } from '@xoram/plugin-panoramique/src';
import { emailPromptDefinition } from './definitions';

export default definePlugin(() => { // [!code focus:100]
	dependsOn(userPlugin);
	// remember to add panoramique as a dependency of your plugin
	dependsOn(panoramiquePlugin); // [!code highlight]

	onCreated(app => {
		onEvent(app.services.userService, 'userAuthenticated', ({ user }) => {
				// if the user is logged in we already know if they want our
				// newsletter or not
				if (app.services.userService.isLoggedIn(user)) {
					return;
				}

				// register the email prompt popup so it shows in any component that
				// has it declared as a child
				app.services.panoramique.register(/* [!hint: definition:] */emailPromptDefinition); // [!code highlight]
			},
		);
	});
});