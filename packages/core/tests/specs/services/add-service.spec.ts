import { describe } from 'vitest';
import { it } from '../../fixture/test.fixture';


describe('addService', () => {
	describe('service registration', () => {
		describe('invocation', () => {
			it.todo('should warn when called in a hook', () => {
			});
			it.todo('should warn when called outside a plugin', () => {
			});
			it.todo('should add the service to the application if none exist with the same id', () => {
			});
			it.todo('should warn and skip if a service with the same id already exist on the application', () => {
			});
		});
		describe('life cycle', () => {
			it.todo('should fire `beforeServiceAdded` during the plugin\'s mount phase', () => {
			});
			it.todo('should fire `serviceAdded` during the plugin\'s mount phase', () => {
			});
			it.todo('should fire `serviceAdded` after `beforeServiceAdded`', () => {
			});
		});
	});
	describe('automatic removal', () => {
		it.todo('should emits a `before_destroy` event', () => {

		});
		it.todo('should remove the service during the plugin\'s teardown phase', () => {
		});
	});


});