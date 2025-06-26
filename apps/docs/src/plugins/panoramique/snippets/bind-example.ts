import { defineComponentDefinition } from '@xoram/plugin-panoramique';
import { ref } from 'vue';
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

const email = ref('');

defineComponentDefinition( // [!code focus:100]
	/* [!hint: id:] */'email-prompt', /* [!hint: component:] */NewsletterSubscriptionModal,
	/* [!hint: setup:] */({ bind }) => {
		// [!code highlight:4]
		// giving a direct value
		bind(/* [!hint: prop:] */'label', /* [!hint: value:] */'The email address to subscribe with');
		// using a ref and passing modifiers
		bind(/* [!hint: prop:] */'email', /* [!hint: value:] */email, /* [!hint: modifiers:] */'lazy', 'trim');
	},
);

