export type OneOrMore<item> = item | [ item, ...item[] ];

export function toArray<item>(items: OneOrMore<item>): item[] {
	return Array.isArray(items) ? items : [ items ];
}
