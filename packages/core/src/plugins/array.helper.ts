/**
 * @public
 */
export type OneOrMore<item> = item | [ item, ...item[] ];

/**
 * @internal
 */
export function toArray<item>(items: OneOrMore<item>): item[] {
	return Array.isArray(items) ? items : [ items ];
}
