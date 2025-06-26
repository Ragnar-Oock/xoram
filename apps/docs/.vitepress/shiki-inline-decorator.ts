import type { ShikiTransformer, ThemedToken } from '@shikijs/types';
import type { Element } from 'hast';

const inlineDecoratorMatcher = /(?<content>(\/\*|<!--)\s*\[!(?<kind>hint|annotation):\s*(?<text>.*?)]\s*(\*\/|-->))/gm;
const tokenMatcher = /(?<indent>[\s\t]*)(?<content>.*)/;

export const inlineDecorator = {
	name: 'inline-hint-decorations',
	span(hast: Element): Element {
		if (hast.tagName !== 'span') { return hast; }

		const child = hast.children[0];
		if (child === undefined || child?.type !== 'text') { return hast; }

		const match = inlineDecoratorMatcher.exec(child.value);

		if (match === null) { return hast; }

		child.value = match.groups.text;
		// mark the hint as such
		this.addClassToHast(hast, 'inline-hint');
		// hide the hint from the copy button
		this.addClassToHast(hast, 'vp-copy-ignore');

		if (match.groups.kind === 'annotation') {
			this.addClassToHast(hast, 'annotation');
		}
	},

	tokens(lines: ThemedToken[][]): ThemedToken[][] {
		lines.forEach(line => {
			line.forEach((token, index) => {
				if (!token.content.includes('!hint')) { return; }

				const match = tokenMatcher.exec(token.content);
				if (match === null || match.groups.indent.length === 0) { return; }

				const { indent, content } = match.groups;
				line.splice(
					index,
					1,
					{
						content: indent,
						offset: token.offset,
					} satisfies ThemedToken,
					{
						...token,
						content: content,
						offset: token.offset + indent.length,
					} satisfies ThemedToken,
				);
			});
		});

		return lines;
	},
} satisfies ShikiTransformer;
