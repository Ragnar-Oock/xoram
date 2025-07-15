import { createApp, definePlugin, dependsOn, onCreated } from '@xoram/core';
import type { AnyNode } from './document/fragment.model';
import { ParserModel } from './document/parser';
import { SchemaModel } from './document/schema.model';
import { Serializer } from './document/serializer';
import type { BlockNode } from './document/types';
import { parserPlugin } from './dom-parser.plugin';
import { domRendererPlugin } from './dom-renderer.plugin';
import { htmlRendererPlugin } from './html-renderer.plugin';
import { paragraphBuilderPlugin } from './node-builder/paragraph-builder.plugin';
import { textBuilderPlugin } from './node-builder/text-builder.plugin';

createApp([
	parserPlugin,
	htmlRendererPlugin,
	domRendererPlugin,
	paragraphBuilderPlugin,
	textBuilderPlugin,
	definePlugin(() => {
		dependsOn(parserPlugin.id);
		dependsOn(htmlRendererPlugin.id);

		const textarea = document.getElementById('editor') as HTMLElement;
		const output = document.getElementById('output') as HTMLElement;

		const serializer = new Serializer();

		onCreated(app => {

			const schema = new SchemaModel();

			schema
				.registerNodeType('doc', {
					content: '*',
				})
				.registerNodeType('p', {
					content: 'text',
					parse: [
						{
							selectors: [ 'p' ],
							getAttributes: () => ({}),
						},
					],
				})
				.registerNodeType('text', {})
				.registerNodeType('i', {
					content: 'text',
					parse: [
						{
							selectors: [ 'i', 'em' ],
							getAttributes: () => ({}),
						},
					],
				});

			let doc: BlockNode;

			function update(): void {
				doc = new ParserModel(schema, new DOMParser())
					.parse(textarea.childNodes);

				output.replaceChildren(serializer.render(doc));
				console.log(render(doc));
			}

			textarea.addEventListener('change', update);
			textarea.addEventListener('input', update);
			update();
		});
	}),
]);

function render(node: AnyNode): string {
	let content = node.content.map(child => render(child));
	if (content.length === 0 && node.text) {
		content = [ node.text ];
	}
	return `<${ node.type.name }:\n${ content.join('')
		.split('\n')
		.map(line => `\t${ line }`)
		.join('\n') }\n:${ node.type.name }>\n`;
}