import { page } from '@vitest/browser/context';
import { addPlugins, addService, createApp, definePlugin, destroyApp } from '@zoram/core';
import { describe, expect } from 'vitest';
import { panoramiquePlugin } from '../../../src';
import { panoramique } from '../../../src/service/panoramique.service';
import { vueService } from '../../../src/service/vue.service';
import ContextMenu from '../../component/context-menu.vue';
import { it } from '../../fixture/test.fixture';

describe('Vue service', () => {
	it('should hold a Vue app', ({ app }) => {

		addPlugins([
			definePlugin(() => {
				addService('vue', vueService);
			}),
		], app);
		const service = app.services.vue;

		expect(service.app).not.toBe(undefined);
		expect(service.app).toSatisfy(value => (
			value !== null
			&& typeof value === 'object'
			// check that the significant Vue App methods are present
			&& [
				'use',
				'mixin',
				'component',
				'directive',
				'mount',
				'unmount',
				'provide',
				'runWithContext',
			].every(method => typeof value[method] === 'function')
		));
	});
	it('should leave the app unmounted', ({ app }) => {
		addPlugins([
			definePlugin(() => {
				addService('vue', vueService);
				addService('panoramique', panoramique); // both services are coupled and can't work without one another
			}),
		], app);

		// re-mounting an already mounted Vue App will fail catastrophically
		expect(() => app.services.vue.app.mount(document.body)).not.toThrow();
	});
	it('should unmount the vue app on plugin removal', async () => {
		const app = createApp([ panoramiquePlugin ]);

		app.services.vue.app.mount(document.body);

		app.services.panoramique.register({
			id: 'test',
			type: ContextMenu,
			props: {
				open: true,
			},
		});

		app.services.panoramique.addChild('root', 'test');

		await expect.element(page.getByRole('menu')).toBeVisible();

		destroyApp(app);

		expect(document.body).toBeEmptyDOMElement();
	});
});