---
"@xoram/plugin-panoramique": patch
"@xoram/core": patch
---

Fix issues with proxies and getters on services being invoked once on
registration and then never again. This broke integrations with Vue's
reactivity.

Deprecate `ServiceAsStore` in favor of `StoreAsService`.