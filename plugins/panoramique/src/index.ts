// noinspection ES6UnusedImports
import type { ServiceCollection } from '@zoram/core'; // eslint-disable-line no-unused-vars
import type { PanoramiqueService } from './service/panoramique.service';
import type { VueService } from './service/vue.service';

declare module '@zoram/core' {
	interface ServiceCollection {
		/**
		 * Expose the Vue App instance.
		 */
		vue: VueService;

		/**
		 * Register components and compose them to build your UI.
		 */
		panoramique: PanoramiqueService;
	}
}

export type {
	VueService,
	PanoramiqueService,
};

export { panoramiquePlugin } from './plugin';

export { addChild } from './helper/add-child';
export { register } from './helper/register';
export type { ComponentDefinitionHelpers, DefinedComponentDefinition } from './helper/define-component-definition';
export { defineComponentDefinition } from './helper/define-component-definition';
export { rootHarness } from './service/panoramique.service';

export type {
	ComponentEvents,
	ComponentHarness,
	ComponentPropAndModels,
	HarnessChildren,
	HarnessListenableEvents,
	NativeEvents,
	ExposedComponentProps,
	ComponentDefinition,
	ChildrenIds,
} from './service/component-definition.type';

export type {
	OverloadProps,
	OverloadParameters,
	OverloadUnion,
	OverloadUnionRecursive,
	Multiplex,
	RemoveIndex,
	First,
	AfterFirst,
	NonNever,
	Writable,
} from './service/helper.type';
