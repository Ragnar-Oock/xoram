import { defineComponentDefinition } from '@xoram/plugin-panoramique';
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

defineComponentDefinition( // [!code focus:14]
	/* [!hint: id:] */'email-prompt', /* [!hint: component:] */NewsletterSubscriptionModal,
	/* [!hint: setup:] */({ on }) => {
		// listening for native events
		on(/* [!hint: event:] */'focusin', /* [!hint: handler:] */() => {
			// let's assume we have to send an analytics event via a service
			analyticsService.send('newsletter-interacted');
		});
		// listening for component events
		on(/* [!hint: event:] */'before-submit', /* [!hint: handler:] */() => {
			/* very important stuff to do before submitting */
		});
	},
);

