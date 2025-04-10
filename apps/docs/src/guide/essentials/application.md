# Creating an application

A zoram application is entirely described by the list of plugins you pass to 
the `createApp` function, they will implement all of your applicative and 
business logic.

```js
import {createApp} from '@zoram/core';

const app = createApp({
    plugins: [ /* your plugins goes here */]
});
```
## Identifying an app

You might find yourself in situations where you have two or more application 
sharing the same global context, debugging in such a case can get annoying if 
you don't have a way of telling the instances apart, this can be remedied by 
providing an `id` to the `createApp` function that will be shown in the dev
tools and the logs of the application.

```js
import {createApp} from '@zoram/core';

const app = createApp({
    id: 'myApp',
    plugins: [ /* your plugins goes here */]
});
```