---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Zoram"
  text: "A lightweight plugin framework"
  tagline: A plugin engine that gets out of your way
  actions:
    - theme: brand
      text: Markdown Examples
      link: /markdown-examples
    - theme: alt
      text: API Examples
      link: /api-examples

features:
  - title: Plugins
    details: Facilitate separation of concerns and reusability
    link: /guide/essentials/plugins
    icon: 🧩
  - title: Services
    details: Expose logic between plugins
    link: /guide/essentials/services
    icon: 🛒
  - title: Lightweight
    details: As little as ~1Kb 
    icon: 🪶
---

<script setup>
// suppress ES6UnusedImports
import HomePage from '@theme/components/HomePage.vue';
import VPButton from 'vitepress/dist/client/theme-default/components/VPButton.vue';
</script>

<HomePage />

## You said simple ?

<div class="grid cols2">

<div>

```js [my-plugin.js]
import {definePlugin} from "@zoram/core";

export default definePlugin(() => {
	/* your plugin logic */
});
```

</div>
<div>

Define your plugins programmatically.

</div>

<div>

::: code-group

```js [my-dependent-plugin.js]
import {definePlugin, dependsOn} from "@zoram/core";
import MyDependency from './my-dependency';

const pluginA = definePlugin(() => {
	dependsOn(MyDependency.id);

	/* your plugin logic */
});
```

```js [my-dependency.js]
import {definePlugin} from "@zoram/core";

export default definePlugin(() => {
	/* your plugin logic */
});
```

:::

</div>
<div>

Setup dependencies.

</div>
<div>

```js [app.js]
import {createApp} from "@zoram/core";
import MyDependency from './my-dependency';
import MyDependentPlugin from './my-dependent-plugin';

createApp([
	MyDependency,
	MyDependentPlugin
]);
```

</div>
<div>

Assemble your app from the plugins you need and let it load the plugins
according to their dependencies.

</div>
</div>

## Build by developers for developers

- Fully Open Source
- Designed to be flexible
- Easy to reason about
- Tells you what is wrong when you mess up

<VPButton text="Read the doc" href="/guide/quick-start" theme="brand" tag="a"/>
<VPButton text="View the Sources" href="https://github.com/Ragnar-Oock/zoram" theme="alt" tag="a"/>

