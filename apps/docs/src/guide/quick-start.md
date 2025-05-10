# Quick Start

## Installation

::: code-group

```shell [npm]
npm i @zoram/core --save
```

```shell [yarn]
yarn add @zoram/core
```

:::

## Creating an application

A zoram application is entirely described by the list of plugins you pass to
the `createApp` function, they will implement all of your applicative and
business logic.

```js [src/app.js]
import {createApp} from '@zoram/core';

createApp([ /* your plugins will go here */]);
```

## Creating a plugin

This will create a plugin that logs "I'm a plugin" when it is loaded into an
application instance.

```js [src/my-plugin.js]
import {definePlugin} from '@zoram/core';

export default definePlugin(() => {
	console.log("I'm a plugin !");
})
```

## Using your plugin

Now simply add your plugin to the list of plugin of the application.

```js
import {createApp} from '@zoram/core';
import MyPlugin from './my-plugin.js';

createApp([MyPlugin]);
```

## Getting in the weeds

Now that you have an idea of how zoram works you might want to know if it can
do more and it can. Follow along as we get more and more in depth into what
zoram can do for you.