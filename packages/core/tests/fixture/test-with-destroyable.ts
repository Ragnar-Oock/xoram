import { test } from 'vitest';
import { type Application, type ApplicationConfig, createApp } from '../../src';

export type Destroyable = {destroy: () => void};

export type DestroyableTest = {
	autoDestroy: <destroyable extends Destroyable>(destroyable: destroyable) => destroyable;
	autoDestroyedApp: (plugins: ApplicationConfig['plugins']) => Application;
}

const testWithDestroyable = test.extend<DestroyableTest>({
	// oxlint-disable-next-line no-empty-pattern
	autoDestroy: async ({}, use) => {
		let local: Destroyable | undefined;

		await use((destroyable) => {
			local = destroyable
			return destroyable;
		});

		local?.destroy();
	},
	autoDestroyedApp: async ({autoDestroy, task}, use) => {
		return await use((plugins: ApplicationConfig['plugins']) => {
			return autoDestroy(createApp({id: task.id, plugins}))
		})
	}
})


export {
	testWithDestroyable as test,
	testWithDestroyable as it,
}