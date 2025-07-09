import { createApp, definePlugin, dependsOn, onCreated } from '@xoram/core';
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

		let textarea: HTMLElement;
		const parser = new DOMParser();

		onCreated(app => {
			textarea = document.getElementById('editor') as HTMLElement;

			textarea?.addEventListener('input', () => {
				const nodes: Node[] = Array.from(parser.parseFromString(
					textarea.innerHTML ?? '',
					'text/html',
				).body.childNodes);
				const doc = app.services.nodeBuilder.parse(nodes);

				console.log(doc, JSON.stringify(doc, undefined, 2));
			});

			textarea.addEventListener('pointerdown', event => {
				console.log(document.caretPositionFromPoint(event.clientX, event.clientY));
			});

		});
	}),
]);