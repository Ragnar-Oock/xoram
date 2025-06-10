import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { ref } from 'vue';
import { type ComponentDefinitionHelpers, defineComponentDefinition } from '../../../src';
import ContextMenu from '../../component/context-menu.vue';
import { expectPrettyWarn } from '../../fixture/expect.fixture';


function getNoop(): () => void {
	return () => void 0;
}

const id = 'identifier';
describe('defineComponentDefinition', () => {
	describe('pure definition', () => {
		it('should return an object with the provided id', () => {
			const definition = defineComponentDefinition(id, ContextMenu);

			expect(definition).toHaveProperty('id');
			expect(definition.id).toBe(id);
		});
		it('should return an object with the provided component', () => {
			const definition = defineComponentDefinition(id, ContextMenu);

			expect(definition).toHaveProperty('id');
			expect(definition.id).toBe(id);
		});
	});
	describe('stateful definition', () => {
		it('should invoke the setup function', () => {
			const setupSpy = vi.fn();

			defineComponentDefinition(id, ContextMenu, setupSpy);

			expect(setupSpy).toHaveBeenCalledOnce();
		});
		describe('setup context', () => {
			it('should provide a setup context', () => {
				let context: ComponentDefinitionHelpers<typeof ContextMenu> | undefined;

				defineComponentDefinition(id, ContextMenu, ctx => {context = ctx;});

				expect(context?.bind).toBeTypeOf('function');
				expect(context?.on).toBeTypeOf('function');
				expect(context?.slot).toBeTypeOf('function');
			});
			describe('setup context : on', () => {
				it('should add an event listener to the definition', () => {
					const handler = getNoop();
					const definition = defineComponentDefinition(id, ContextMenu, (ctx) => {
						ctx.on('open', handler);
					});

					expect(definition.events.open).toStrictEqual([ handler ]);
				});
				it('should be invocable unbounded', () => {
					const handler = getNoop();
					const definition = defineComponentDefinition(id, ContextMenu, ({ on }) => {
						on('open', handler);
					});

					expect(definition.events.open).toStrictEqual([ handler ]);
				});
				it('should infer the types of declared events', () => {
					defineComponentDefinition(id, ContextMenu, ({ on }) => {
						on('open', event => {
							expectTypeOf(event).toEqualTypeOf<MouseEvent>();
							return void event;
						});

						on(
							'open',
							// @ts-expect-error we expect the event parameter to be flagged as invalid
							(event: string) => {
								return void event;
							},
						);
					});
				});
				it('should not allow undeclared and non-native events', () => {
					defineComponentDefinition(id, ContextMenu, ({ on }) => {
						on(
							// @ts-expect-error bob should not be an allowed type here
							'bob',
							getNoop(),
						);
					});
				});
				it('should not override previous calls (allow multiple handler for same event)', () => {
					const handler1 = getNoop(), handler2 = getNoop();
					const definition = defineComponentDefinition(id, ContextMenu, ({ on }) => {
						on('open', handler1);
						on('open', handler2);
					});

					expect(definition.events.open).toSatisfy(value => Array.isArray(value) && value.includes(handler1));
					expect(definition.events.open).toSatisfy(value => Array.isArray(value) && value.includes(handler2));
				});
			});
			describe('setup context : bind', () => {
				it('should add a prop to the definition', () => {
					const definition = defineComponentDefinition(id, ContextMenu, (ctx) => {
						ctx.bind('testid', 'bob');
					});

					expect(definition.props.testid).toBe('bob');
				});
				it('should be invocable unbounded', () => {
					const definition = defineComponentDefinition(id, ContextMenu, ({ bind }) => {
						bind('testid', 'bob');
					});

					expect(definition.props.testid).toBe('bob');
				});
				it('should infer the type of declared props', () => {
					const value = 'bob';
					const reactiveValue = ref(value);
					defineComponentDefinition(id, ContextMenu, ({ bind }) => {
						// valid values for testid
						bind('testid', value);
						bind('testid', reactiveValue);
						bind('testid', () => value);
						bind('testid', () => reactiveValue.value);


						// invalid values for testid
						bind(
							'testid',
							// @ts-expect-error testid can't receive undefined
							undefined, // oxlint-disable-line no-useless-undefined
						);

						bind(
							'testid',
							// @ts-expect-error testid can't receive null
							null, // oxlint-disable-line no-null
						);
						bind(
							'testid',
							// @ts-expect-error testid can't receive a number
							0,
						);
						bind(
							'testid',
							// @ts-expect-error testid can't receive a ref(number)
							ref(0),
						);
						bind(
							'testid',
							// @ts-expect-error testid can't receive a () => number
							() => 0,
						);
					});
				});
				it('should not allow declared props', () => {
					defineComponentDefinition(id, ContextMenu, ({ bind }) => {
						bind(
							// @ts-expect-error 'undeclared' is not a valid prop to bind a value to
							'undeclared',
							'value', // this value's type doesn't matter
						);
					});
				});
				it('should set the model modifiers when given', () => {
					const definitionWithoutModifier = defineComponentDefinition(id, ContextMenu, ({ bind }) => {
						bind('open', true);
					});
					const definitionWithModifier = defineComponentDefinition(id, ContextMenu, ({ bind }) => {
						bind(
							'open',
							true,
							'modifier1',
							'modifier2',
							'modifier3',
							'modifier4',
						);
					});

					expect(definitionWithoutModifier.props.openModifiers).toBeUndefined();
					expect(definitionWithModifier.props.openModifiers).toStrictEqual({
						modifier1: true,
						modifier2: true,
						modifier3: true,
						modifier4: true,
					});
				});
				// dunno how many modifiers can be expected, no idea how to test for any number of them so the 4 of the
				// previous test will do for now
				it.skip('should not limit the number of model modifiers', () => {});
				it('should take a direct value', () => {
					const definition = defineComponentDefinition(id, ContextMenu, ({ bind }) => {
						bind('open', true);
					});

					expect(definition.props.open).toBe(true);
				});
				it('should take a ref value', () => {
					const definition = defineComponentDefinition(id, ContextMenu, ({ bind }) => {
						bind('open', ref(true));
					});

					expect(definition.props.open.value).toBe(true);
				});
				it('should take a getter', () => {
					const definition = defineComponentDefinition(id, ContextMenu, ({ bind }) => {
						bind('open', () => true);
					});

					expect(definition.props.open()).toBe(true);
				});
			});
			describe('setup context : slot', () => {
				it('should add a children to the definition', () => {
					const definition = defineComponentDefinition(id, ContextMenu, (ctx) => {
						ctx.slot('option', 'default');
					});

					expect(definition.children.default).toStrictEqual([ 'option' ]);
				});
				it('should be invocable unbounded', () => {
					const definition = defineComponentDefinition(id, ContextMenu, ({ slot }) => {
						slot('option', 'default');
					});

					expect(definition.children.default).toStrictEqual([ 'option' ]);
				});
				it('should infer the name of the slots', () => {
					const definition = defineComponentDefinition(id, ContextMenu, ({ slot }) => {
						slot('option', 'bottom');
						slot('option', 'default');

						slot(
							'option',
							// @ts-expect-error 'not-a-slot' is not a valid slot name for the ContextMenu component
							'not-a-slot',
						);
					});

					expect(definition.children.default).toStrictEqual([ 'option' ]);
				});
				// no idea what this test means... I might have been drunk when I wrote that
				it('should warn when given a non-declared float', () => {}); // oxlint-disable-line no-empty-function
				it('should default to the "default" slot when not given one', () => {
					const definition = defineComponentDefinition(id, ContextMenu, ({ slot }) => {
						slot('option');
					});

					expect(definition.children.default).toStrictEqual([ 'option' ]);
				});
				it('should insert the child at the given index when positive and bounded', () => {
					const definition = defineComponentDefinition(id, ContextMenu, ({ slot }) => {
						slot('option1', 'default');
						slot('option2', 'default');
						slot('option3', 'default', 1);
					});

					expect(definition.children.default).toStrictEqual([ 'option1', 'option3', 'option2' ]);
				});
				it(
					'should insert the child at the end when the index is greater than the number of current children',
					() => {
						const definition = defineComponentDefinition(id, ContextMenu, ({ slot }) => {
							slot('option1', 'default');
							slot('option2', 'default', 15);
						});

						expect(definition.children.default).toStrictEqual([ 'option1', 'option2' ]);
					},
				);
				it('should the child at the end minus the index when given a negative number', () => {
					const definition = defineComponentDefinition(id, ContextMenu, ({ slot }) => {
						slot('option1', 'default');
						slot('option2', 'default');
						slot('option3', 'default', -1);
					});

					expect(definition.children.default).toStrictEqual([ 'option1', 'option3', 'option2' ]);
				});
				it.runIf(import.meta.env.DEV)('should warn and ignore index if given a float (dev only)', () => {
					const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(getNoop());

					const definition = defineComponentDefinition(id, ContextMenu, ({ slot }) => {
						slot('option1', 'default');
						slot('option2', 'default', 0.5);
					});

					expectPrettyWarn(consoleWarn, new Error('slot() index parameter must be an integer, received 0.5.'));
					expect(definition.children.default).toStrictEqual([ 'option1', 'option2' ]);
				});
			});
		});
	});
});