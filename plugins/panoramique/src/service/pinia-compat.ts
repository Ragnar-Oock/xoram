import type { Service } from '@xoram/core';
import type { Store } from 'pinia';
import type { ComputedRef } from 'vue';

/**
 * Generic type for a function that can infer arguments and return type
 *
 * Stolen from Pinia's types
 *
 * @public
 */
export declare type _Method = (...args: unknown[]) => unknown;

/**
 * List all action-like members of an object.
 *
 * Stolen from Pinia's types
 *
 * @public
 */
export declare type _ExtractActionsFromSetupStore<SS> = SS extends undefined | void
	? Record<string, never>
	: Pick<SS, _ExtractActionsFromSetupStore_Keys<SS>>;

/**
 * List all keys of action-like members of an object.
 *
 * Stolen from Pinia's types
 *
 * @public
 */
export declare type _ExtractActionsFromSetupStore_Keys<SS> = keyof {
	[K in keyof SS as SS[K] extends _Method ? K : never]: unknown;
};

/**
 * List all getter-like members of an object.
 *
 * Stolen from Pinia's types
 *
 * @public
 */
export declare type _ExtractGettersFromSetupStore<SS> = SS extends undefined | void
	? Record<string, never>
	: Pick<SS, _ExtractGettersFromSetupStore_Keys<SS>>;

/**
 * List all keys of getter-like members of an object.
 *
 * Stolen from Pinia's types
 *
 * @public
 */
export declare type _ExtractGettersFromSetupStore_Keys<SS> = keyof {
	[K in keyof SS as SS[K] extends ComputedRef ? K : never]: unknown;
};

/**
 * List all state-like members of an object.
 *
 * Stolen from Pinia's types
 *
 * @public
 */
export declare type _ExtractStateFromSetupStore<SS> = SS extends undefined | void
	? Record<string, never>
	: Pick<SS, _ExtractStateFromSetupStore_Keys<SS>>;


/**
 * List all keys of state-like members of an object.
 *
 * Stolen from Pinia's types
 *
 * @public
 */
export declare type _ExtractStateFromSetupStore_Keys<SS> = keyof {
	[K in keyof SS as SS[K] extends _Method | ComputedRef ? never : K]: unknown;
};


/**
 * Turn a {@link https://pinia.vuejs.org/core-concepts/ | Pinia `store`} into a
 * {@link @xoram/core#Service| xoram `Service`}.
 *
 * @example
 * ```ts
 * // using an inferred store
 * export const useBlog = defineStore('blog', () => {
 *   // blog store setup
 * });
 * defineService<StoreAsService<ReturnType<typeof useBlog>>(() => useBlog())
 * ```
 * @example
 * ```ts
 * // using a typed store
 * export interface BlogStore {
 *   // blog store API
 * }
 * export const useBlog = defineStore<'blog', BlogStore>('blog', () => {
 *   // blog store setup
 * });
 * defineService<StoreAsService<BlogStore>(() => useBlog())
 * ```
 *
 * @public
 */
export type StoreAsService<
	store,
	notifications extends Record<string, unknown> = Record<string, unknown>,
	storeId extends string = string
> =
	(store extends Store
		? store
		: Store<
			storeId,
			_ExtractStateFromSetupStore<store>,
			_ExtractGettersFromSetupStore<store>,
			_ExtractActionsFromSetupStore<store>
		>)
	& Service<notifications>
	;

/**
 * Convert a {@link @xoram/core#Service| Service} into the corresponding
 * {@link https://pinia.vuejs.org/core-concepts/ | Pinia `store`} interface.
 *
 * @example
 * ```ts
 * export interface BlogService extends Service {
 *    posts: Post[];
 * }
 *
 * defineStore<'blog', ServiceAsStore<BlogService>>('blog', () => {
 *   // blog service implementation
 * }
 * ```
 *
 * @deprecated use {@link StoreAsService} instead or let typescript infer your store type
 *
 * @public
 */
export type ServiceAsStore<service extends Service> = Omit<service, keyof Service>;
