import {
	addPlugin,
	type Application,
	createApp,
	definePlugin,
	dependsOn,
	destroyApp,
	onBeforeCreate,
	onCreated,
	type PluginDefinition,
} from '@xoram/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { commanderPlugin } from '../../src';
import type { Command, CommandConstructor } from '../../src/api/command';

import type { ChainedCommand } from '../../src/api/command.service';
import type { State, StateService } from '../../src/api/state.service';
import type { Transaction } from '../../src/api/transaction';
import { ReplaceTestValueStep } from '../replace-test-value.step';

declare module '../../src/api/command.service' {
	// noinspection JSUnusedGlobalSymbols
	export interface CommandCollection {
		test: (msg?: string) => void;
	}
}

const noop = (): void => void 0;

const claim = 'test';
const initialValue = () => ({ value: '' });

const testCommandConstructor: CommandConstructor<[ msg?: string ]> = msg => (state, transaction, dispatch) => {
	if (msg === undefined || state.realms[claim]?.value === undefined) {
		return false;
	}
	if (dispatch) {
		transaction.add(new ReplaceTestValueStep(claim, msg));
	}
	return true;
};

const testPlugin: PluginDefinition = definePlugin(() => {
	dependsOn(commanderPlugin.id);

	onBeforeCreate(({ services }) => {
		services.state.claim(claim, initialValue());
		services.commander.register('test', testCommandConstructor);
	});
});

describe('commander service', () => {
	let app: Application;
	beforeEach(({ task }) => {
		app = createApp([
			commanderPlugin,
		], { id: task.name });
	});
	afterEach(() => {
		destroyApp(app);
		// @ts-expect-error app will always be defined in places where it is used
		app = undefined;
	});

	describe('commands', () => {
		it('should hold registered commands', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.commands.test).toBeTypeOf('function');
		});
		it('should be non-assignable (no setter)', () => {
			addPlugin(testPlugin, app);

			expect(() => {
				// @ts-expect-error cannot assign to commands
				app.services.commander.commands = noop;
			}).toThrow(TypeError);
		});
		it('should be non-writable (no [[Set]] method)', () => {
			addPlugin(testPlugin, app);

			// @ts-expect-error cannot assign to test
			app.services.commander.commands.test = noop;

			expect(app.services.commander.commands.test).toBeTypeOf('function');
		});
		// it.todo('should be enumerable ([[OwnKeys]] method)', () => {});
		// it.todo('should be queryable ([[HasProperty]] method)', () => {});
	});
	describe('can', () => {
		it('should hold the registered commands', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.can.test).toBeTypeOf('function');
		});
		it('should be non-assignable (no setter)', () => {
			addPlugin(testPlugin, app);

			expect(() => {
				// @ts-expect-error cannot assign to commands
				app.services.commander.can = noop;
			}).toThrow(TypeError);
		});
		it('should be non-writable (no [[Set]] method)', () => {
			addPlugin(testPlugin, app);

			// @ts-expect-error cannot assign to test
			app.services.commander.can.test = noop;

			expect(app.services.commander.can.test).toBeTypeOf('function');
		});
		// it.todo('should be enumerable ([[OwnKeys]] method)', () => {});
		// it.todo('should be queryable ([[HasProperty]] method)', () => {});
		it('should have a .chain getter', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.can.chain).toBeTypeOf('object');
		});
	});
	describe('chain', () => {
		it('should hold the registered commands', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.chain.test).toBeTypeOf('function');
		});
		it('should be non-assignable (no setter)', () => {
			addPlugin(testPlugin, app);

			expect(() => {
				// @ts-expect-error cannot assign to commands
				app.services.commander.chain = noop;
			}).toThrow(TypeError);
		});
		it('should be non-writable (no [[Set]] method)', () => {
			addPlugin(testPlugin, app);

			// @ts-expect-error cannot assign to test
			app.services.commander.chain.test = noop;

			expect(app.services.commander.chain.test).toBeTypeOf('function');
		});
		// it.todo('should be enumerable ([[OwnKeys]] method)', () => {});
		// it.todo('should be queryable ([[HasProperty]] method)', () => {});
		it('should have a .run() method', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.chain.run).toBeTypeOf('function');
		});
	});
	describe('commands[command]', () => {
		it('should invoke the command constructor with the given arguments', () => {
			const commandConstructor = vi.fn<(msg?: string) => Command>(testCommandConstructor);
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', commandConstructor);
				});
			}), app);

			app.services.commander.commands.test('message');

			expect(commandConstructor).toHaveBeenCalledExactlyOnceWith('message');
		});
		it('should invoke the command with the current state instance', () => {
			let receivedState: State | undefined;
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', _msg => (state, _transaction, _dispatch): boolean => {
						receivedState = state;
						return true;
					});
				});
			}), app);

			app.services.commander.commands.test('message');

			expect(receivedState).toBe(app.services.state);
		});
		it('should invoke the command with an empty transaction', () => {
			let tr: Transaction | undefined;
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', _msg => (_app, transaction, _dispatch): boolean => {
						tr = transaction;
						return true;
					});
				});
			}), app);

			app.services.commander.commands.test('message');

			expect(tr?.steps).toStrictEqual([]);
		});
		it('should invoke the command with a dispatch function', () => {
			// oxlint-disable-next-line no-null
			let dispatchFunction: ((transaction: Transaction) => void) | null | undefined = null;
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', _msg => (_app, _transaction, dispatch): boolean => {
						dispatchFunction = dispatch;
						return true;
					});
				});
			}), app);

			app.services.commander.commands.test();

			expect(dispatchFunction).toBeTypeOf('function');
		});
		it('should return true when the command succeeds', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.commands.test('works!')).toBeTruthy();
		});
		it('should return false when the command fails', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.commands.test(/*don't work when no message*/)).toBeFalsy();
		});
		it('should perform the action', () => {
			addPlugin(testPlugin, app);
			expect(app.services.state.realms[claim]).toStrictEqual(initialValue());

			app.services.commander.commands.test('hello');

			expect(app.services.state.realms[claim]).toStrictEqual({ value: 'hello' });
		});
		it('should add the transaction to history', () => {
			addPlugin(testPlugin, app);

			expect(app.services.history.hasPast).toBeFalsy();

			app.services.commander.commands.test('hello');

			expect(app.services.history.hasPast).toBeTruthy();
		});
	});
	describe('can[command]', () => {
		it('should invoke the command constructor with the given arguments', () => {
			const commandConstructor = vi.fn<(msg?: string) => Command>(testCommandConstructor);
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', commandConstructor);
				});
			}), app);

			app.services.commander.can.test('message');

			expect(commandConstructor).toHaveBeenCalledExactlyOnceWith('message');
		});
		it('should invoke the command with the app instance', () => {
			let receivedState: State | undefined;
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', _msg => (state, _transaction, _dispatch): boolean => {
						receivedState = state;
						return true;
					});
				});
			}), app);

			app.services.commander.can.test('message');

			expect(receivedState).toBe(app.services.state);
		});
		it('should invoke the command with an empty transaction', () => {
			let tr: Transaction | undefined;
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', _msg => (_app, transaction, _dispatch): boolean => {
						tr = transaction;
						return true;
					});
				});
			}), app);

			app.services.commander.can.test('message');

			expect(tr?.steps).toStrictEqual([]);
		});
		it('should invoke the command without a dispatch function', () => {
			// oxlint-disable-next-line no-null
			let dispatchFunction: ((transaction: Transaction) => void) | null | undefined = null;
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', _msg => (_app, _transaction, dispatch): boolean => {
						dispatchFunction = dispatch;
						return true;
					});
				});
			}), app);

			app.services.commander.commands.test();

			expect(dispatchFunction).toBeTypeOf('function');
		});
		it('should return true when the command can apply', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.commands.test('works!')).toBeTruthy();
		});
		it('should return false when the command can\' apply', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.commands.test(/*don't work when no message*/)).toBeFalsy();
		});
		it('should not perform the action', () => {
			addPlugin(testPlugin, app);
			expect(app.services.state.realms[claim]).toStrictEqual(initialValue());

			app.services.commander.can.test('hello');

			expect(app.services.state.realms[claim]).toStrictEqual(initialValue());
		});
		it('should keep the transaction out of the history', () => {
			addPlugin(testPlugin, app);

			expect(app.services.history.hasPast).toBeFalsy();

			app.services.commander.can.test('hello');

			expect(app.services.history.hasPast).toBeFalsy();
		});
	});
	describe('chain[command]', () => {
		it('should invoke the command constructor with the given arguments', () => {
			const commandConstructor = vi.fn<(msg?: string) => Command>(testCommandConstructor);
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', commandConstructor);
				});
			}), app);

			app.services.commander.chain.test('message');

			expect(commandConstructor).toHaveBeenCalledExactlyOnceWith('message');
		});
		it('should invoke all the commands with the app instance', () => {
			const states: StateService[] = [];
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', _msg => (state, _transaction, _dispatch): boolean => {
						states.push(state);
						return true;
					});
				});
			}), app);

			app.services.commander.chain.test('message');

			expect(states).toSatisfy(value => Array.isArray(value) && value.every(item => item === value[0]));
			expect(states[0]).toBe(app.services.state);
		});
		it('should invoke the first command with an empty transaction', () => {
			let tr: Transaction | undefined;
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', _msg => (_app, transaction, _dispatch): boolean => {
						tr = transaction;
						return true;
					});
				});
			}), app);

			app.services.commander.chain.test('message');

			expect(tr?.steps).toStrictEqual([]);
		});
		it('should invoke all the chained commands with the same transaction', () => {
			const transactions: Transaction[] = [];
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', _msg => (_app, transaction, _dispatch): boolean => {
						transactions.push(transaction);
						return true;
					});
				});
			}), app);

			app.services.commander.chain.test('message 1').test('message 2');

			expect(transactions).toSatisfy(value => Array.isArray(value) && value.every(item => item === value[0]));
		});
		it('should invoke all the commands with a dispatch function', () => {
			const dispatchFunctions: (((tr: Transaction) => void) | undefined)[] = [];
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', _msg => (_app, _transaction, dispatch): boolean => {
						dispatchFunctions.push(dispatch);
						return true;
					});
				});
			}), app);

			app.services.commander.chain.test('message');

			expect(dispatchFunctions).toSatisfy(value => Array.isArray(value) && value.every(item => item === value[0]));
			expect(dispatchFunctions[0]).toBeTypeOf('function');
		});
		it('should not perform the action', () => {
			addPlugin(testPlugin, app);
			expect(app.services.state.realms[claim]).toStrictEqual(initialValue());

			app.services.commander.chain.test('hello');

			expect(app.services.state.realms[claim]).toStrictEqual(initialValue());
		});
		it('should return the chain object', () => {
			const chains: ChainedCommand[] = [];
			addPlugin(testPlugin, app);

			const chain = app.services.commander.chain;
			chains.push(chain);
			chains.push(chain.test('message 1'));
			chains.push(chain.test('message 2'));

			expect(chains).toSatisfy(value => Array.isArray(value) && value.every(item => item === value[0]));
		});
	});
	describe('chain.run()', () => {
		it('should perform the commands actions', () => {
			addPlugin(testPlugin, app);

			const chain = app.services.commander.chain.test('hello');

			expect(app.services.state.realms[claim]).toStrictEqual(initialValue());

			chain.run();

			expect(app.services.state.realms[claim]).toStrictEqual({ value: 'hello' });
		});
		it('should add the transaction to history', () => {
			addPlugin(testPlugin, app);

			const chain = app.services.commander.chain.test('hello');

			expect(app.services.history.hasPast).toBeFalsy();

			chain.run();

			expect(app.services.history.hasPast).toBeTruthy();
		});
	});
	describe('register', () => {
		it('should add the command to the list of available commands', () => {
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', testCommandConstructor);
				});
			}), app);

			expect(app.services.commander.commands.test).toBeTypeOf('function');
			expect(app.services.commander.can.test).toBeTypeOf('function');
			expect(app.services.commander.chain.test).toBeTypeOf('function');
		});
		it('should return the service', () => {
			expect(app.services.commander.register('test', testCommandConstructor)).toBe(app.services.commander);
		});
	});
});