# Quick Start

## Installation

::: code-group

```shell [npm]
npm i @xoram/core --save
```

```shell [yarn]
yarn add @xoram/core
```

:::

## Creating an application

A xoram application is entirely described by the list of plugins you pass to the
`createApp` function, they will implement all of your applicative and business
logic.

```js [src/app.js]
import {createApp} from '@xoram/core';

createApp([ /* your plugins will go here */]);
```

## Creating a plugin

This will create a plugin that logs "I'm a plugin" when it is loaded into an
application instance.

```js [src/my-plugin.js]
import {definePlugin} from '@xoram/core';

export default definePlugin(() => {
	console.log("I'm a plugin !");
})
```

## Using your plugin

Now simply add your plugin to the list of plugin of the application.

```js
import {createApp} from '@xoram/core';
import MyPlugin from './my-plugin.js';

createApp([MyPlugin]);
```

## Getting in the weeds

Now that you have an idea of how xoram works you might want to know if it can do
more and it can. Follow along as we get more and more in depth into what xoram
can do for you.