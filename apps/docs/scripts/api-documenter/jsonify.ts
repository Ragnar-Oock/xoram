export function stringify(obj: unknown, depth = 1): string {
	if (obj === undefined) {
		return '"undefined"';
	}
	if (!obj) {
		return JSON.stringify(obj, undefined, 2);
	}
	if (typeof obj !== 'object') {
		return JSON.stringify(obj, undefined, 2);
	}
	return JSON.stringify(
		JSON.parse(
			depth < 1
				? '"<truncated content>"'
				: `{${ Object.keys(obj)
					.map((k) => `"${ k }": ${ stringify(obj[k], depth - 1) }`)
					.join(', ') }}`,
		),
		undefined,
		2,
	);


}