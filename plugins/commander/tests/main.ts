import { createApp, definePlugin, onBeforeCreate, onCreated } from '@xoram/core';
import { commanderPlugin } from '../src';
import type { Step } from '../src/commander.service';

declare module '../src/commander.service' {
	export interface CommandCollection {
		hi: (msg?: string) => void;
	}
}

class HiStep implements Step {
	private p: HTMLParagraphElement | undefined;

	constructor(private msg: string) {}

	public apply(): void {
		this.p = document.createElement('p');
		this.p.innerText = this.msg;
		document.body.append(this.p);
	}

	public remove(): void {
		this.p?.remove();
		this.p = undefined;
	};

}

const app = createApp([
	commanderPlugin,
	definePlugin('test-commander', () => {
		onBeforeCreate(({ services }) => {
			services.commander.register('hi', (msg) => (_app, tr, dispatch): boolean => {
				if (typeof msg !== 'string') {
					return false;
				}
				if (dispatch) {
					tr.add(new HiStep(msg));
				}
				return true;
			});
		});

		onCreated(({ services }) => {
			console.log('1', services.commander.commands.hi('hello world'));
			console.log('2', services.commander.can.hi('hello world'));
			console.log('3', services.commander.can.hi());
			console.log('4', services.commander.chain.hi('hello').hi('world').run());
			console.log('5', services.commander.can.chain.hi('hello').hi('world').run());
			console.log('6', services.commander.can.chain.hi().hi('world').run());

		});
	}),
]);

console.log(app);
// @ts-expect-error app doesn't exist on window
window.app = app;