import { describe, it } from 'vitest';

describe('defineComponentDefinition', () => {
	describe('pure definition', () => {
		it.todo('should return an object with the provided id', () => {});
		it.todo('should return an object with the provided component', () => {});
	});
	describe('stateful definition', () => {
		it.todo('should take a setup function', () => {});
		it.todo('should invoke the setup function', () => {});
		describe('setup context', () => {
			it.todo('should provide a setup context', () => {});
			describe('setup context : on', () => {
				it.todo('should add an event listener to the definition', () => {});
				it.todo('should be invocable unbounded', () => {});
				it.todo('should infer the types of declared events', () => {});
				it.todo('should allow non-declared events', () => {});
				it.todo('should not override previous calls (allow multiple handler for same event)', () => {});
			});
			describe('setup context : bind', () => {
				it.todo('should add a prop to the definition', () => {});
				it.todo('should be invocable unbounded', () => {});
				it.todo('should infer the type of declared props', () => {});
				it.todo('should allow non-declared props', () => {});
				it.todo('should set the model modifiers when given', () => {});
				it.todo('should not limit the number of model modifiers', () => {});
				it.todo('should take a direct value', () => {});
				it.todo('should take a ref value', () => {});
				it.todo('should take a getter', () => {});
			});
			describe('setup context : slot', () => {
				it.todo('should add a children to the definition', () => {});
				it.todo('should be invocable unbounded', () => {});
				it.todo('should infer the name of the slots', () => {});
				it.todo('should warn when given a non-declared float', () => {});
				it.todo('should default to the "default" slot when not given one', () => {});
				it.todo('should insert the child at the given index when positive and bounded', () => {});
				it.todo(
					'should insert the child at the end when the index is greater than the number of current children',
					() => {},
				);
				it.todo('should the child at the end minus the index when given a negative number', () => {});
				it.todo('should warn if given a float', () => {});
			});
		});
	});
});