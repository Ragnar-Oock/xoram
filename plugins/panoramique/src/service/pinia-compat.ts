import type { Service, ServiceNotifications } from '@xoram/core';
import type { Emitter } from 'mitt';
import type { Store } from 'pinia';
import type { ComputedRef } from 'vue';

// we can't use `unknown` in the following types as nothing can be assigned to it, that would narrow down the filters
// to `never` every time

// oxlint-disable no-explicit-any

/**
 * Generic type for a function that can infer arguments and return type
 *
 * Stolen from Pinia's types
 *
 * @public
 */
export declare type _Method = (...args: any[]) => any;

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
	[K in keyof SS as SS[K] extends _Method ? K : never]: any;
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
	[K in keyof SS as SS[K] extends ComputedRef ? K : never]: any;
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
	[K in keyof SS as SS[K] extends _Method | ComputedRef ? never : K]: any;
};

// oxlint-enable no-explicit-any


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
