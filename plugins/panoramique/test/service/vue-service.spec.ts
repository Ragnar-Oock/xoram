import { addPlugins, addService, definePlugin } from '@zoram/core';
import { describe, expect } from 'vitest';
import { panoramique } from '../../src/service/panoramique.service';


import { vueService } from '../../src/service/vue.service';
import { it } from '../fixture/test.fixture';

describe('Vue service', () => {
	it('should hold a Vue app', ({ app }) => {
		const service = vueService(app);

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
	it('should use PanoramiqueRoot as the root component of the app', ({ app }) => {
		// this test uses internal APIs from Vue, it might break at any time, and I'm not sure if it even is useful

		const service = vueService(app);

		expect(service.app._component.__name).toBe('panoramique-root');
	});
});