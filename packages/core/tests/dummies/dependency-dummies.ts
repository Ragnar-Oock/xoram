import { definePlugin, dependsOn } from '../../src';
import { noop } from './noop';

export const purePlugin = definePlugin('A', noop);
export const dependentPlugin = definePlugin('B', () => {
	dependsOn(purePlugin.id);
});
export const circularDep1 = definePlugin('C1', () => {
	dependsOn(circularDep2.id);
});
export const circularDep2 = definePlugin('C2', () => {
	dependsOn(circularDep1.id);
});