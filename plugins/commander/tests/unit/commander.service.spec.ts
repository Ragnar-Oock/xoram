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
	interface CommandCollection {
		// command set by individual tests
		testCommand: () => void;
		spy: () => void;
	}
}

const allItemsAreStrictlyEqual = (value: unknown) => Array.isArray(value) && value.every(item => item === value[0]);

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
				let transactions: Transaction[] = [];
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
			it('should invoke the command with a can command collection', () => {
				let hasCan: boolean | undefined;
				addPlugins([
					definePlugin(() => {
						dependsOn(commanderPlugin.id);
						dependsOn(testPlugin.id);

						onCreated(({ services }) => {
							services.commander
								.register('testCommand', () => ({ can }) => {
										hasCan = can.append('hello');
										return true;
									},
								);
						});
					}), testPlugin,
				], app);

				app.services.commander.commands.testCommand();

				expect(app.services.state.realms[claim]).toStrictEqual(initialValue());
				expect(hasCan).toBeTruthy();
			});
			it('should invoke the command with a command collection adding to the same transaction', () => {
				addPlugins([
					definePlugin(() => {
						dependsOn(commanderPlugin.id);
						dependsOn(testPlugin.id);

						onCreated(({ services }) => {
							services.commander
								.register('testCommand', () => ({ command }) => {
									return command.append('hello') && command.append(' world');
								});
						});
					}),
					testPlugin,
				], app);

				const spy = vi.spyOn(app.services.state, 'apply');

				app.services.commander.commands.testCommand();
				expect(app.services.state.realms[claim].value).toStrictEqual('hello world');

				expect(spy).toHaveBeenCalledOnce();
			});
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
			it('should invoke the command with a chain in dry run', () => {
				let hasChain: boolean | undefined;
				addPlugins([
					definePlugin(() => {
						dependsOn(commanderPlugin.id);
						dependsOn(testPlugin.id);

						onCreated(({ services }) => {
							services.commander
								.register('testCommand', () => ({ chain }) => {
									hasChain = typeof chain === 'object';
									return chain.append('hello').append(' world').run();
								});
						});
					}),
					testPlugin,
				], app);


				app.services.commander.can.testCommand();

				expect(hasChain).toBeTruthy();
				expect(app.services.state.realms[claim]).toStrictEqual(initialValue()); // the chain should not have run
			});
			it('should invoke the command with a can command collection', () => {
				let hasCan: boolean | undefined;
				addPlugins([
					definePlugin(() => {
						dependsOn(commanderPlugin.id);
						dependsOn(testPlugin.id);

						onCreated(({ services }) => {
							services.commander
								.register('testCommand', () => ({ can }) => {
										hasCan = can.append('hello');
										return true;
									},
								);
						});
					}), testPlugin,
				], app);

				app.services.commander.can.testCommand();

				expect(app.services.state.realms[claim]).toStrictEqual(initialValue());
				expect(hasCan).toBeTruthy();
			});
			it('should invoke the command with a command collection in dry run', () => {
				let hasCommand: boolean | undefined;
				addPlugins([
					definePlugin(() => {
						dependsOn(commanderPlugin.id);
						dependsOn(testPlugin.id);

						onCreated(({ services }) => {
							services.commander
								.register('testCommand', () => ({ command }) => {
									hasCommand = typeof command === 'object';
									return command.append('hello') && command.append(' world');
								});
						});
					}),
					testPlugin,
				], app);

				app.services.commander.can.testCommand();

				expect(hasCommand).toBeTruthy();
				// the nested commands should not have been applied
				expect(app.services.state.realms[claim]).toStrictEqual(initialValue());
			});
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
			it('should invoke the command with a chain adding to the same transaction', () => {
				let transactions: Transaction[] = [];
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

				app.services.commander.chain.testCommand();

				expect(transactions).toSatisfy(allItemsAreStrictlyEqual);
			});
			it('should invoke the command with a different chain than the current one', () => {
				let nestedChain: ChainedCommand | undefined;
				addPlugins([
					definePlugin(() => {
						dependsOn(commanderPlugin.id);
						dependsOn(testPlugin.id);

						onCreated(({ services }) => {
							services.commander
								.register('testCommand', () => ({ chain }) => {
										nestedChain = chain;
										return chain
											.append('1')
											.append('2')
											.run();
									},
								);
						});
					}), testPlugin,
				], app);

				const chain = app.services.commander.chain
					.testCommand()
					.testCommand();

				expect(nestedChain).not.toBe(chain);
			});
			it('should invoke the command with a can command collection', () => {
				let hasCan: boolean | undefined;
				addPlugins([
					definePlugin(() => {
						dependsOn(commanderPlugin.id);
						dependsOn(testPlugin.id);

						onCreated(({ services }) => {
							services.commander
								.register('testCommand', () => ({ can }) => {
										hasCan = can.append('hello');
										return true;
									},
								);
						});
					}), testPlugin,
				], app);

				app.services.commander.chain.testCommand();

				expect(hasCan).toBeTruthy();
			});
			it('should invoke the command with a command collection adding to the same transaction', () => {
				const transactions: Transaction[] = [];
				addPlugins([
					definePlugin(() => {
						dependsOn(commanderPlugin.id);
						dependsOn(testPlugin.id);

						onCreated(({ services }) => {
							services.commander
								.register('testCommand', () => ({ command, transaction }) => {
									transactions.push(transaction);
									return command.spy() && command.append(' world');
								})
								.register('spy', () => ({ transaction }) => {
									transactions.push(transaction);
									return true;
								});
						});
					}),
					testPlugin,
				], app);

				app.services.commander.chain.testCommand().spy();

				expect(transactions).toSatisfy(allItemsAreStrictlyEqual);
			});
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