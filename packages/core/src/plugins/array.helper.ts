export function toArray<item>(items: item | item[]): item[] {
	return Array.isArray(items) ? items : [items];
}
