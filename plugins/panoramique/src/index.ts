/**
 * @packageDocumentation
 * Vue and Pinia integration for zoram.
 *
 * View doc at {@link https://zoram.dev/plugins/panoramique/}.
 */


export type { PanoramiqueService, ServiceAsStore } from './service/panoramique.service';
export type { VueService } from './service/vue.service';

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
