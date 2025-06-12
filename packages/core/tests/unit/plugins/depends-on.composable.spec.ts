import { describe, expect } from 'vitest';
import { createApp, type DefinedPlugin, definePlugin, dependsOn, onCreated } from '../../../src';
import { getActivePlugin } from '../../../src/plugins/active-plugin';
import { purePlugin } from '../../dummies/dependency-dummies';
import { expectPrettyWarn } from '../../fixture/expect.fixture';
import { it } from '../../fixture/test.fixture';


describe('dependsOn', () => {
	it('should add the dependency\'s id to the plugin definition\' dependency list', () => {
		const definedPlugin = definePlugin(() => {
			dependsOn(purePlugin.id);
		})();

		expect(definedPlugin.dependencies.includes(purePlugin.id), 'plugin dependencies constraint is missing')
			.toBeTruthy();
	});
	describe.runIf(import.meta.env.DEV)('dev mode', () => {
		it('should warn when and abort invoked in a plugin hook', ({ warnSpy }) => {
			let plugin: DefinedPlugin | undefined;
			createApp([
				definePlugin(() => {
					onCreated(() => {
						plugin = getActivePlugin();
						dependsOn(purePlugin.id);
					});
				}),
				purePlugin,
			]);

			expectPrettyWarn(
				warnSpy,
				new Error(
					'Invoked dependsOn outside of a plugin\'s setup function, dependsOn can\'t be used in hooks or outside of a plugin setup function.'),
			);

			expect(plugin?.dependencies?.includes(purePlugin.id)).toBeFalsy();
		});
		it('should warn when used outside a plugin setup function', ({ warnSpy }) => {
			dependsOn(purePlugin.id);

			expectPrettyWarn(
				warnSpy,
				new Error(
					'Invoked dependsOn outside of a plugin\'s setup function, dependsOn can\'t be used in hooks or outside of a plugin setup function.'),
			);
		});
	});
});

