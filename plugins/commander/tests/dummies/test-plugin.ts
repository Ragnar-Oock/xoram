import { definePlugin, dependsOn, onBeforeCreate, type PluginDefinition } from '@xoram/core';
import { type CommandConstructor, defaultCommanderPlugin as commanderPlugin } from '../../src';
import { ReplaceTestValueStep } from './replace-test-value.step';

declare module '../../src/api/command.service' {
	// noinspection JSUnusedGlobalSymbols
	export interface CommandCollection {
		// set the value of the claimed realm to `msg`
		setValue: (msg?: string) => void;
		// append `msg` to the current value of the claimed realm
		append: (msg?: string) => void;
	}
}
export const claim = 'test';
export const initialValue = () => ({ value: '' });
export const setValueCommandConstructor: CommandConstructor<[ msg?: string ]> = msg => ({
	state,
	transaction,
	dispatch,
}) => {
	if (msg === undefined || state.realms[claim]?.value === undefined) {
		return false;
	}
	if (dispatch) {
		transaction.add(new ReplaceTestValueStep(claim, 0, -1, msg));
	}
	return true;
};
const appendToValueCommandConstructor: CommandConstructor<[ msg?: string ]> = msg => ({
	state,
	transaction,
	dispatch,
}) => {
	if (msg === undefined || state.realms[claim]?.value === undefined) {
		return false;
	}
	if (dispatch) {
		transaction.add(new ReplaceTestValueStep(claim, -1, -1, msg));
	}
	return true;
};
export const testPlugin: PluginDefinition = definePlugin('testPlugin', () => {
	dependsOn(commanderPlugin.id);

	onBeforeCreate(({ services }) => {
		services.state.claim(claim, initialValue());
		services.commander
			.register('setValue', setValueCommandConstructor)
			.register('append', appendToValueCommandConstructor);
	});
});