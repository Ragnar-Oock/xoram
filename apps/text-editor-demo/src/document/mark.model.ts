import type { Attributes, Mark, MarkType } from './types';

export class MarkModel implements Mark {
	constructor(
		public readonly type: MarkType,
		public readonly attributes: Attributes = {},
	) {}

}