# @xoram/plugin-panoramique

## 0.1.2

### Patch Changes

- ad1fbd4: update dependencies:

  - vue `^3.5.14` => `^3.5.17`
  - pinia `^3.0.2` => `^3.0.3`
  - vue-component-type-helpers `^2.2.10` => `^3.0.1`

  fix :

  - incorrect type cast in panoramique-platform implementation leading to type
    errors at build time

- eeff026: Fix issues with proxies and getters on services being invoked once on
  registration and then never again. This broke integrations with Vue's
  reactivity.

  Deprecate `ServiceAsStore` in favor of `StoreAsService`.

- Updated dependencies [eeff026]
  - @xoram/core@0.1.1

## 0.1.1

### Patch Changes

- 810b534: expose ServiceAsStore type

## 0.1.0

### Minor Changes

- 30a1f3e: Initial Realise

  See documentation at https://xoram.dev

### Patch Changes

- Updated dependencies [30a1f3e]
  - @xoram/core@0.1.0
