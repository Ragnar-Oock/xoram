import {
	addPlugin,
	type Application,
	createApp,
	definePlugin,
	dependsOn,
	destroyApp,
	onCreated,
	type PluginDefinition,
} from '@xoram/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { commanderPlugin } from '../../src';
import type { ChainedCommand, Command, CommandConstructor, Transaction } from '../../src/commander.service';
import { TestStep } from '../test-step';

declare module '../../src/commander.service' {
	export interface CommandCollection {
		test: (msg?: string) => void;
	}
}

// oxlint-disable-next-line func-style
const noop = (): void => void 0;
// oxlint-disable-next-line func-style
const testCommandConstructor: CommandConstructor<[ msg?: string ]> = msg => (app, transaction, dispatch) => {
	if (msg === undefined) {
		return false;
	}
	if (dispatch) {
		transaction.add(new TestStep(msg));
	}
	return true;
};
const testPlugin: PluginDefinition = definePlugin(() => {
	dependsOn(commanderPlugin.id);

	onCreated(({ services }) => {

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
		it('should invoke the command with the app instance', () => {
			let application: Application | undefined;
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', _msg => (app, _transaction, _dispatch): boolean => {
						application = app;
						return true;
					});
				});
			}), app);

			app.services.commander.commands.test('message');

			expect(application).toBe(app);
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
		// todo find a way to inject the transaction creation
		it.todo('should apply the transaction', () => {});
		// todo history interface to be determined
		it.todo('should add the transaction to the past branch of history', () => {});
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
			let application: Application | undefined;
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', _msg => (app, _transaction, _dispatch): boolean => {
						application = app;
						return true;
					});
				});
			}), app);

			app.services.commander.can.test('message');

			expect(application).toBe(app);
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
		// todo find a way to inject the transaction creation
		it.todo('should keep the transaction floating', () => {});
		// todo history interface to be determined
		it.todo('should keep the transaction out of the history', () => {});
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
			const apps: Application[] = [];
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('test', _msg => (app, _transaction, _dispatch): boolean => {
						apps.push(app);
						return true;
					});
				});
			}), app);

			app.services.commander.chain.test('message');

			expect(apps).toSatisfy(value => Array.isArray(value) && value.every(item => item === value[0]));
			expect(apps[0]).toBe(app);
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
		// todo find a way to inject the transaction creation
		it.todo('should not apply the transaction', () => {});
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
		// todo find a way to inject the transaction creation
		it.todo('should apply the transaction', () => {});
		// todo history interface to be determined
		it.todo('should add the transaction to history', () => {});
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