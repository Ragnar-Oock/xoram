import { createApp, definePlugin, onBeforeCreate, onCreated, onEvent } from '@xoram/core';
import { createApp as createVueApp, h, type Ref, ref } from 'vue';
import { defaultCommanderPlugin as commanderPlugin, type HistoryEvent } from '../src';
import { ReplaceTestValueStep } from './replace-test-value.step';

declare module '../src/api/command.service' {
	export interface CommandCollection {
		replaceLine: (text?: string) => void;
	}
}

const claim = 'test-commander';
const app = createApp([
	commanderPlugin,
	definePlugin('test-commander', () => {
		onBeforeCreate(({ services }) => {
			services.state.claim(claim, ref(''));

			services.commander.register('replaceLine', (msg) => (state, tr, dispatch): boolean => {
				if (typeof msg !== 'string' || typeof state.realms[claim].value !== 'string') {
					return false;
				}
				if (dispatch) {
					tr.add(new ReplaceTestValueStep(claim, msg));
				}
				return true;
			});
		});

		onCreated(({ services }) => {
			([
				[ `commands.replaceLine('hello world')`, () => services.commander.commands.replaceLine('hello world') ],
				// [ `can.replaceLine('hello world')`, () => services.commander.can.replaceLine('hello world') ],
				// [ `can.replaceLine()`, () => services.commander.can.replaceLine() ],
				[
					`chain.replaceLine('hello').replaceLine('world').run()`,
					() => services.commander.chain.replaceLine('hello').replaceLine('world').run(),
				],
				// [
				// 	`can.chain.replaceLine('hello').replaceLine('world').run()`,
				// 	() => services.commander.can.chain.replaceLine('hello').replaceLine('world').run(),
				// ],
				// [
				// 	`can.chain.replaceLine().replaceLine('world').run()`,
				// 	() => services.commander.can.chain.replaceLine().replaceLine('world').run(),
				// ],
				[ 'undo', () => services.history.undo() ],
			] as const).forEach(([ label, callback ]) => {
				const button = document.createElement('button');
				button.innerText = label;
				button.addEventListener('click', callback);
				xoram.append(button);
			});

		});

		onEvent(
			'history',
			'*',
			(event, { transaction }: HistoryEvent) => console.log(
				event,
				`transaction (${ transaction.steps.length }) : \n${
					transaction.steps.map(step =>
						`\t${ step.constructor.name }(${
							Object
								.entries(step)
								.map(([ k, v ]) => `${ k }: ${ v }`)
								.join(', ')
						})`).join(',\n') }`,
				// transaction,
			),
		);
	}),
]);

console.log(app);
// @ts-expect-error app doesn't exist on window
window.app = app;

createVueApp((props: { line: Ref<string> }) => h('p', { innerHTML: props.line?.value ?? '' }), {
	line: app.services.state.realms[claim],
}).mount('#vue');