import type { ShikiTransformer } from '@shikijs/types';
import type { Element } from 'hast';

const inlineDecoratorMatcher = /\/\*\s*\[!hint:\s*(?<text>.*?)]\s*\*\//gm;

export const inlineDecorator = {
	name: 'inline-hint-decorations',
	span(hast: Element): Element {
		if (hast.tagName !== 'span') { return hast; }

		const child = hast.children[0];
		if (child === undefined || child?.type !== 'text') { return hast; }

		const match = inlineDecoratorMatcher.exec(child.value);

		if (match === null) { return hast; }

		child.value = match[1];
		// mark the hint as such
		this.addClassToHast(hast, 'inline-hint');
		// hide the hint from the copy button
		this.addClassToHast(hast, 'vp-copy-ignore');
	},
} satisfies ShikiTransformer;
