import { defineComponentDefinition } from '@zoram-plugin/panoramique';
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal.vue';

defineComponentDefinition( // [!code focus:19]
	/* [!hint: id:] */'email-prompt', /* [!hint: component:] */NewsletterSubscriptionModal,
	/* [!hint: setup:] */({ slot }) => {
		// add the child at the end of the default slot
		slot(/* [!hint: childId:] */'child-in-default-slot');
		// add the child at the end of a named slot
		slot(/* [!hint: childId:] */'child-in-named-slot', /* [!hint: slotName:] */'footer');
		// add the child at the start of a named slot
		slot(/* [!hint: childId:] */'child-at-the-start', /* [!hint: slotName:] */'default', /* [!hint: index:] */0);
		// add the child at any index of a named slot
		slot(/* [!hint: childId:] */'child-at-index', /* [!hint: slotName:] */'default', /* [!hint: index:] */ 1);
		// add the child at any index of a named slot counting from the end
		slot(
			/* [!hint: childId:] */'child-at-index-from-the-end',
			/* [!hint: slotName:] */'footer',
			/* [!hint: index:] */-2,
		);
	},
);

