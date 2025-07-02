import { definePlugin } from '@xoram/core';
import { defineComponentDefinition, register } from '@xoram/plugin-panoramique';
import { ref } from 'vue';
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

// [!code focus:100]
const email = ref('');

export default definePlugin(() => {
	register(/*[!hint:definition]*/defineComponentDefinition(
		/*[!hint:id:]*/'email-prompt',
		/*[!hint:type:]*/NewsletterSubscriptionModal,
		/*[!hint:setup:]*/({ bind }) => {
			bind('email', email);
		},
	));
});