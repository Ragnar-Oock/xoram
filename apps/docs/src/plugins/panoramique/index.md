---
prev:
  text: 'Collection'
  link: '/plugins'
next:
  text: 'Describing components'
  link: '/plugins/panoramique/describing-components'
---

# Panoramique

Use [Vue.js](https://vuejs.org/) and [Pinia](https://pinia.vuejs.org/) to build
dynamic User Interfaces.

::: info

The following documentation assumes you know at least the basics
of [Vue.js](https://vuejs.org/), you should get comfortable with how it works
before trying to integrate panoramique into your app.

:::

## Install

::: code-group

```shell:no-line-numbers [npm]
npm i @xoram/plugin-panoramique
```

```shell:no-line-numbers [yarn]
yarn add @xoram/plugin-panoramique
```

```shell:no-line-numbers [pnpm]
pnpm add @xoram/plugin-panoramique
```

:::

Add the plugin to your app :

::: code-group

```ts [my-app.ts]
import { createApp } from '@xoram/core';
import { panoramiquePlugin } from "@xoram/plugin-panoramique"; // [!code highlight]

createApp([
	panoramique, // [!code highlight]
	/* your plugins goes here */
]);
```

:::

## Quick setup

You can will need to have a plugin mount the Vue application setup by
`panoramique` to the DOM where and when you want to. Other components will be
able to register and mount components has needed.

::: code-group

<<< ./snippets/mount-app.plugin.ts

<<< ./snippets/my-cool-button.plugin.ts

```ts [my-app.ts]
import { createApp } from '@xoram/core';
import { panoramiquePlugin } from "@xoram/plugin-panoramique";
import { myCoolButtonPlugin } from "./my-cool-button.plugin.ts";
import { mountingPlugin } from "./mount.plugin.ts";

createApp([
	panoramique,
	mountingPlugin, // [!code highlight]
	myCoolButtonPlugin, // [!code highlight]
]);
```

<<< ./snippets/my-button.vue

:::

## Usage in depth

We only covered the very basics here, to learn more about all the features of
Panoramique, check the in following pages were you'll learn more about component
definitions, harnesses, the helpers provided and how you can use reactivity to
your advantage.

You can also check the API reference for the
[`@xoram/plugin-panoramique`](/api-reference/plugin-panoramique) package.