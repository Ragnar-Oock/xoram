import type { ComponentDefinition } from '@xoram/plugin-panoramique';
import { ref } from 'vue';
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

const email = ref('');

export const emailPromptDefinition = { // [!code focus:100]
	id: 'email-prompt',
	type: NewsletterSubscriptionModal,
	props: {
		// giving a direct value
		label: 'The email address to subscribe with',
		// using a ref
		email: email,
		// passing model modifiers
		emailModifiers: {
			lazy: true,
			trim: true,
		},
	},
	events: {
		// listening for native events
		focusin: [
			// let's assume we have to send an analytics event via a service
			() => analyticsService.send('newsletter-interacted'),
		],
		// listening for component events
		'before-submit': [
			() => { /* very important stuff to do before submitting */ },
		],
	},
	children: {
		default: [ 'child-in-default-slot' ],
		footer: [ 'child-in-named-slot' ],
	},
} satisfies ComponentDefinition<typeof NewsletterSubscriptionModal>;


/** if you only use the default slot you can pass the child list directly :*/
export const emailPromptDefinition2 = {
	id: 'email-prompt',
	type: NewsletterSubscriptionModal,
	children: [ 'child-in-default-slot' ],
};