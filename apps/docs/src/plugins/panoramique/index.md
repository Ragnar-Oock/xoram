---
prev:
  text: 'Collection'
  link: '/plugins'
next:
  text: 'Component Definitions'
  link: '/plugins/panoramique/definitions'
---

# Panoramique

A minimalist [Vue.js](https://vuejs.org/) integration

## Install

::: info

This package have not yet been realised

:::

::: code-group

```shell:no-line-numbers [npm]
npm i @zoram-plugin/panoramique
```

```shell:no-line-numbers [yarn]
yarn add @zoram-plugin/panoramique
```

```shell:no-line-numbers [pnpm]
pnpm add @zoram-plugin/panoramique
```

:::

Then simply add the plugin to your app :

::: code-group

```ts [my-app.ts]
import { createApp } from '@zoram/core';
import { panoramiquePlugin } from "@zoram-plugin/panoramique"; // [!code highlight]

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

```ts [mount.plugin.ts]
import { panoramiquePlugin } from '@zoram-plugin/panoramique/src';
import { definePlugin, dependsOn, onCreated } from '@zoram/core';

export const mountingPlugin = definePlugin('mount-vue-app', () => {
	// declare the dependency on panoramique
	dependsOn(panoramiquePlugin);

	onCreated(app => {
		// you can mount to whatever element you want
		app.services.vue.app.mount('#my-app');
	})
})
```

<<< ./snippets/my-cool-button.plugin.ts

```ts [my-app.ts]
import { createApp } from '@zoram/core';
import { panoramiquePlugin } from "@zoram-plugin/panoramique";
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