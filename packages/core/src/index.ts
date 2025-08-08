/**
 * @packageDocumentation
 * The heart of xoram.
 *
 * View doc at {@link https://xoram.dev}.
 */

export * from './plugins';
export * from './application';
export * from './services';

export type { ErrorContext, MaybeSafeFunction, SafeFunction } from './error-handling';
export { handleError, makeSafe } from './error-handling';


export type * from './type-helper';

export { warn as _warn } from './warn.helper';