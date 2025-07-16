# @xoram/core

## 0.1.1

### Patch Changes

- eeff026: Fix issues with proxies and getters on services being invoked once on
  registration and then never again. This broke integrations with Vue's
  reactivity.

  Deprecate `ServiceAsStore` in favor of `StoreAsService`.

## 0.1.0

### Minor Changes

- 30a1f3e: Initial Realise

  See documentation at https://xoram.dev
