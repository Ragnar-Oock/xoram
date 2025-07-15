import type { AnyNode } from './fragment.model';
import type { SerializeRule } from './types';


function defaultSerializer(node: AnyNode): SerializeRule {
	if (node.text) {
		return { type: 3 };
	}
	return { type: 1, name: node.type.name };
}

export class Serializer {
	render(node: AnyNode): Node {
		const serialize: SerializeRule = node.type.spec.serialize ?? defaultSerializer(node);
		switch (serialize.type) {
			case 1: {
				const element = document.createElement(serialize.name) as HTMLElement;
				element.append(...node.content.map(child => this.render(child)));
				Object.entries(node.attributes).forEach(([ attr, value ]) => element.setAttribute(attr, value.toString()));

				return element;
			}
			case 3: {
				return document.createTextNode(node.text as string);
			}
		}
		throw new Error('you broke it');
	}

}