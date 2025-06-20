import { type Application, createApp, definePlugin, destroyApp } from '@xoram/core';
import { it } from 'vitest';

export type TestFixture = {
	// a dummy app with no plugins to be used as context
	app: Application;
}

// todo : factorise test fixture with those of core
const fixture = it.extend<TestFixture>({
	// eslint-disable-next-line no-empty-pattern
	app: async ({}, use) => {
		let app = createApp([
			// eslint-disable-next-line no-empty-function
			definePlugin(() => {}), // noop plugin to prevent
		]);

		await use(app);

		destroyApp(app);
	},
});


export {
	fixture as it,
	fixture as test,
};