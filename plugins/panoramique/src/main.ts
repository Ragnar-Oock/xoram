import { createApp, definePlugin, dependsOn, onCreated } from '@zoram/core';
import panoramic from './index';
import TestComponent from './TestComponent.vue';

const app = createApp([
	panoramic,
	definePlugin(() => {
		dependsOn(panoramic.id);

		onCreated(({ services: { panoramique, vue } }) => {
			panoramique.register({
				type: TestComponent,
				id: 'test',
				children: {
					notASlot: [
						'otherComponent',
					],
				},
				props: {
					label: 'label',
				},
			});

			panoramique.register({
				type: TestComponent,
				id: 'otherComponent',
				props: {
					label: 'I\'m a test !',
					text: 'default text',
				},
				events: {
					'update:text': console.log,
				},
			});
			panoramique.addChild('root', 'test');

			vue.app.mount('body');
		});
	}),
]);

console.log(app);