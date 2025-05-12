import { type MockInstance, test, vi } from 'vitest';
import { type Application, createApp, destroyApp, type PluginDefinition } from '../../src';

export type Destroyable = { destroy: () => void };

export type DestroyableTest = {
	autoDestroy: (app: Application) => Application;
	autoDestroyedApp: (plugins: PluginDefinition[]) => Application;
	warnSpy: MockInstance<(...data: any[]) => void>
}

const testFixture = test.extend<DestroyableTest>({
	// oxlint-disable-next-line no-empty-pattern
	autoDestroy: async ({}, use) => {
		let local: Application | undefined;

		await use((app) => {
			local = app;
			return app;
		});

		if (local) {
			destroyApp(local);
		}
	},
	autoDestroyedApp: async ({ autoDestroy, task }, use) => {
		return await use((plugins: PluginDefinition[]) => {
			return autoDestroy(createApp(plugins, { id: task.id }));
		});
	},
	// oxlint-disable-next-line no-empty-pattern
	warnSpy: async ({}, use) => {
		const spy = vi.spyOn(console, 'warn');
		await use(spy);
		spy.mockReset();
	},
});


export {
	testFixture as test,
	testFixture as it,
};