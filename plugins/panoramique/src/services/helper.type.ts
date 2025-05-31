/**
 * Utility for extracting the parameters from a function overload (for typed emits)
 * https://github.com/microsoft/TypeScript/issues/32164#issuecomment-1146737709
 */
// we need the "any" here because of how ComponentEmit is typed
// eslint-disable-next-line no-explicit-any
export type OverloadParameters<T extends (...args: any[]) => unknown> = Parameters<OverloadUnion<T>>;
export type OverloadProps<TOverload> = Pick<TOverload, keyof TOverload>;
export type OverloadUnionRecursive<TOverload, TPartialOverload = unknown> = TOverload extends (...args: infer TArgs) =>
		infer TReturn ? TPartialOverload extends TOverload ? never : OverloadUnionRecursive<TPartialOverload & TOverload,
		TPartialOverload & ((...args: TArgs) => TReturn) & OverloadProps<TOverload>> | ((...args: TArgs) => TReturn) :
	never;
export type OverloadUnion<TOverload extends (...args: unknown[]) => unknown> = Exclude<OverloadUnionRecursive<(() => never)
	& TOverload>, TOverload extends () => never ? never : () => never>;


/**
 * Extract the first element from a tuple
 */
export type First<tuple> = tuple extends [ infer first, ...unknown[] ] ? first : never;
/**
 * Extract everything but the first element of a tuple
 */
export type AfterFirst<tuple> = tuple extends [ unknown, ...infer rest ] ? rest : never;

/**
 * Turn a record of stuff into a record of arrays of stuff
 */
export type Multiplex<record> = {
	[key in keyof record]: Array<record[key]>;
}

/**
 * Make all properties in `record` writable
 */
export type Writable<record> = {
	-readonly [P in keyof record]: record[P];
};
/**
 * Filter out any property of `record` that evaluates to `never`.
 */
export type NonNever<record> = {
	[K in keyof record as record[K] extends never ? never : K]: record[K];
}