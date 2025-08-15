import {
	addPlugin,
	addPlugins,
	type Application,
	createApp,
	definePlugin,
	dependsOn,
	destroyApp,
	onCreated,
} from '@xoram/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultCommanderPlugin as commanderPlugin } from '../../src';
import type { Command } from '../../src/api/command';

import type { ChainedCommand } from '../../src/api/command.service';
import type { State, StateService } from '../../src/api/state.service';
import type { Transaction } from '../../src/api/transaction';
import { claim, initialValue, setValueCommandConstructor, testPlugin } from '../dummies/test-plugin';

declare module '../../src/api/command.service' {
	// noinspection JSUnusedGlobalSymbols
	export interface CommandCollection {
		// command set by individual tests
		testCommand: () => void;
	}
}

const allItemsAreStrictlyEqual = value => Array.isArray(value) && value.every(item => item === value[0]);

const noop = (): void => void 0;

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

			expect(app.services.commander.commands.setValue).toBeTypeOf('function');
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

			// @ts-expect-error cannot assign to setValue
			app.services.commander.commands.setValue = noop;

			expect(app.services.commander.commands.setValue).toBeTypeOf('function');
		});
		// it.todo('should be enumerable ([[OwnKeys]] method)', () => {});
		// it.todo('should be queryable ([[HasProperty]] method)', () => {});
	});
	describe('can', () => {
		it('should hold the registered commands', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.can.setValue).toBeTypeOf('function');
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

			// @ts-expect-error cannot assign to setValue
			app.services.commander.can.setValue = noop;

			expect(app.services.commander.can.setValue).toBeTypeOf('function');
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

			expect(app.services.commander.chain.setValue).toBeTypeOf('function');
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

			// @ts-expect-error cannot assign to setValue
			app.services.commander.chain.setValue = noop;

			expect(app.services.commander.chain.setValue).toBeTypeOf('function');
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
			const commandConstructor = vi.fn<(msg?: string) => Command>(setValueCommandConstructor);
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('setValue', commandConstructor);
				});
			}), app);

			app.services.commander.commands.setValue('message');

			expect(commandConstructor).toHaveBeenCalledExactlyOnceWith('message');
		});
		describe('command parameters', () => {
			it('should invoke the command with the current state instance', () => {
				let receivedState: State | undefined;
				addPlugin(definePlugin(() => {
					dependsOn(commanderPlugin.id);

					onCreated(({ services }) => {
						services.commander.register('setValue', _msg => ({ state }): boolean => {
							receivedState = state;
							return true;
						});
					});
				}), app);

				app.services.commander.commands.setValue('message');

				expect(receivedState).toBe(app.services.state);
			});
			it('should invoke the command with an empty transaction', () => {
				let tr: Transaction | undefined;
				addPlugin(definePlugin(() => {
					dependsOn(commanderPlugin.id);

					onCreated(({ services }) => {
						services.commander.register('setValue', _msg => ({ transaction }): boolean => {
							tr = transaction;
							return true;
						});
					});
				}), app);

				app.services.commander.commands.setValue('message');

				expect(tr?.steps).toStrictEqual([]);
			});
			it('should invoke the command with a dispatch function', () => {
				// oxlint-disable-next-line no-null
				let dispatchFunction: ((transaction: Transaction) => void) | null | undefined = null;
				addPlugin(definePlugin(() => {
					dependsOn(commanderPlugin.id);

					onCreated(({ services }) => {
						services.commander.register('setValue', _msg => ({ dispatch }): boolean => {
							dispatchFunction = dispatch;
							return true;
						});
					});
				}), app);

				app.services.commander.commands.setValue();

				expect(dispatchFunction).toBeTypeOf('function');
			});
			it('should invoke the command with a chain adding to the same transaction', () => {
				let transactions: Transaction = [];
				addPlugins([
					definePlugin(() => {
						dependsOn(commanderPlugin.id);
						dependsOn(testPlugin.id);

						onCreated(({ services }) => {
							services.commander
								.register('testCommand', () => ({ chain, transaction }) => {
										transactions.push(transaction);
										return chain
											.append('1')
											.append('2')
											.spy()
											.run();
									},
								)
								.register('spy', () => ({ transaction }) => {
									transactions.push(transaction);
									return true;
								});
						});
					}), testPlugin,
				], app);

				app.services.commander.commands.testCommand();

				expect(app.services.state.realms[claim].value).toBe('12');
				expect(transactions).toSatisfy(allItemsAreStrictlyEqual);
			});
			it.todo('should invoke the command with a can command collection', () => {});
			it.todo('should invoke the command with a command collection adding to the same transaction', () => {});
		});
		it('should return true when the command succeeds', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.commands.setValue('works!')).toBeTruthy();
		});
		it('should return false when the command fails', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.commands.setValue(/*don't work when no message*/)).toBeFalsy();
		});
		it('should perform the action', () => {
			addPlugin(testPlugin, app);
			expect(app.services.state.realms[claim]).toStrictEqual(initialValue());

			app.services.commander.commands.setValue('hello');

			expect(app.services.state.realms[claim]).toStrictEqual({ value: 'hello' });
		});
		it('should add the transaction to history', () => {
			addPlugin(testPlugin, app);

			expect(app.services.history.hasPast).toBeFalsy();

			app.services.commander.commands.setValue('hello');

			expect(app.services.history.hasPast).toBeTruthy();
		});
	});
	describe('can[command]', () => {
		it('should invoke the command constructor with the given arguments', () => {
			const commandConstructor = vi.fn<(msg?: string) => Command>(setValueCommandConstructor);
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('setValue', commandConstructor);
				});
			}), app);

			app.services.commander.can.setValue('message');

			expect(commandConstructor).toHaveBeenCalledExactlyOnceWith('message');
		});

		describe('command parameters', () => {
			it('should invoke the command with the current state instance', () => {
				let receivedState: State | undefined;
				addPlugin(definePlugin(() => {
					dependsOn(commanderPlugin.id);

					onCreated(({ services }) => {
						services.commander.register('setValue', _msg => ({ state }): boolean => {
							receivedState = state;
							return true;
						});
					});
				}), app);

				app.services.commander.can.setValue('message');

				expect(receivedState).toBe(app.services.state);
			});
			it('should invoke the command with an empty transaction', () => {
				let tr: Transaction | undefined;
				addPlugin(definePlugin(() => {
					dependsOn(commanderPlugin.id);

					onCreated(({ services }) => {
						services.commander.register('setValue', _msg => ({ transaction }): boolean => {
							tr = transaction;
							return true;
						});
					});
				}), app);

				app.services.commander.can.setValue('message');

				expect(tr?.steps).toStrictEqual([]);
			});
			it('should invoke the command without a dispatch function', () => {
				// oxlint-disable-next-line no-null
				let dispatchFunction: ((transaction: Transaction) => void) | null | undefined = null;
				addPlugin(definePlugin(() => {
					dependsOn(commanderPlugin.id);

					onCreated(({ services }) => {
						services.commander.register('setValue', _msg => ({ dispatch }): boolean => {
							dispatchFunction = dispatch;
							return true;
						});
					});
				}), app);

				app.services.commander.commands.setValue();

				expect(dispatchFunction).toBeTypeOf('function');
			});
			it.todo('should invoke the command with a chain in dry run', () => {});
			it.todo('should invoke the command with a can command collection', () => {});
			it.todo('should invoke the command with a command collection in dry run', () => {});
		});
		it('should return true when the command can apply', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.commands.setValue('works!')).toBeTruthy();
		});
		it('should return false when the command can\' apply', () => {
			addPlugin(testPlugin, app);

			expect(app.services.commander.commands.setValue(/*don't work when no message*/)).toBeFalsy();
		});
		it('should not perform the action', () => {
			addPlugin(testPlugin, app);
			expect(app.services.state.realms[claim]).toStrictEqual(initialValue());

			app.services.commander.can.setValue('hello');

			expect(app.services.state.realms[claim]).toStrictEqual(initialValue());
		});
		it('should keep the transaction out of the history', () => {
			addPlugin(testPlugin, app);

			expect(app.services.history.hasPast).toBeFalsy();

			app.services.commander.can.setValue('hello');

			expect(app.services.history.hasPast).toBeFalsy();
		});
	});
	describe('chain[command]', () => {
		it('should invoke the command constructor with the given arguments', () => {
			const commandConstructor = vi.fn<(msg?: string) => Command>(setValueCommandConstructor);
			addPlugin(definePlugin(() => {
				dependsOn(commanderPlugin.id);

				onCreated(({ services }) => {
					services.commander.register('setValue', commandConstructor);
				});
			}), app);

			app.services.commander.chain.setValue('message');

			expect(commandConstructor).toHaveBeenCalledExactlyOnceWith('message');
		});
		describe('command parameters', () => {
			it('should invoke all the commands with the app instance', () => {
				const states: StateService[] = [];
				addPlugin(definePlugin(() => {
					dependsOn(commanderPlugin.id);

					onCreated(({ services }) => {
						services.commander.register('setValue', _msg => ({ state }): boolean => {
							states.push(state);
							return true;
						});
					});
				}), app);

				app.services.commander.chain.setValue('message');

				expect(states).toSatisfy(allItemsAreStrictlyEqual);
				expect(states[0]).toBe(app.services.state);
			});
			it('should invoke the first command with an empty transaction', () => {
				let tr: Transaction | undefined;
				addPlugin(definePlugin(() => {
					dependsOn(commanderPlugin.id);

					onCreated(({ services }) => {
						services.commander.register('setValue', _msg => ({ transaction }): boolean => {
							tr = transaction;
							return true;
						});
					});
				}), app);

				app.services.commander.chain.setValue('message');

				expect(tr?.steps).toStrictEqual([]);
			});
			it('should invoke all the chained commands with the same transaction', () => {
				const transactions: Transaction[] = [];
				addPlugin(definePlugin(() => {
					dependsOn(commanderPlugin.id);

					onCreated(({ services }) => {
						services.commander.register('setValue', _msg => ({ transaction }): boolean => {
							transactions.push(transaction);
							return true;
						});
					});
				}), app);

				app.services.commander.chain.setValue('message 1').setValue('message 2');

				expect(transactions).toSatisfy(allItemsAreStrictlyEqual);
			});
			it('should invoke all the commands with a dispatch function', () => {
				const dispatchFunctions: (((tr: Transaction) => void) | undefined)[] = [];
				addPlugin(definePlugin(() => {
					dependsOn(commanderPlugin.id);

					onCreated(({ services }) => {
						services.commander.register('setValue', _msg => ({ dispatch }): boolean => {
							dispatchFunctions.push(dispatch);
							return true;
						});
					});
				}), app);

				app.services.commander.chain.setValue('message');

				expect(dispatchFunctions).toSatisfy(allItemsAreStrictlyEqual);
				expect(dispatchFunctions[0]).toBeTypeOf('function');
			});
			it.todo('should invoke the command with a chain adding to the same transaction', () => {});
			it.todo('should invoke the command with a different chain than the current one', () => {});
			it.todo('should invoke the command with a can command collection', () => {});
			it.todo('should invoke the command with a command collection adding to the same transaction', () => {});
		});
		it('should not perform the action', () => {
			addPlugin(testPlugin, app);
			expect(app.services.state.realms[claim]).toStrictEqual(initialValue());

			app.services.commander.chain.setValue('hello');

			expect(app.services.state.realms[claim]).toStrictEqual(initialValue());
		});
		it('should return the chain object', () => {
			const chains: ChainedCommand[] = [];
			addPlugin(testPlugin, app);

			const chain = app.services.commander.chain;
			chains.push(chain);
			chains.push(chain.setValue('message 1'));
			chains.push(chain.setValue('message 2'));

			expect(chains).toSatisfy(allItemsAreStrictlyEqual);
		});
	});
	describe('chain.run()', () => {
		it('should perform the commands actions', () => {
			addPlugin(testPlugin, app);

			const chain = app.services.commander.chain.setValue('hello');

			expect(app.services.state.realms[claim]).toStrictEqual(initialValue());

			chain.run();

			expect(app.services.state.realms[claim]).toStrictEqual({ value: 'hello' });
		});
		it('should add the transaction to history', () => {
			addPlugin(testPlugin, app);

			const chain = app.services.commander.chain.setValue('hello');

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
					services.commander.register('setValue', setValueCommandConstructor);
				});
			}), app);

			expect(app.services.commander.commands.setValue).toBeTypeOf('function');
			expect(app.services.commander.can.setValue).toBeTypeOf('function');
			expect(app.services.commander.chain.setValue).toBeTypeOf('function');
		});
		it('should return the service', () => {
			expect(app.services.commander.register('setValue', setValueCommandConstructor)).toBe(app.services.commander);
		});
	});
});