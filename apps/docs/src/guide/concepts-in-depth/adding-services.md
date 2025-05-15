# Adding services

## Registration

You can add a service to the application by calling the `addService` function
with an `id` and a `service` object or factory, it will be added to the
application during the plugin's `beforeCreate` phase and automatically removed
in `beforeDestroy`.

```js
import {definePlugin, addService} from '@zoram/core';
import MyService from './myService';
import OtherService from './otherService';

export default definePlugin('myPlugin', () => { // [!code focus:6]
	/* passing a ready made object */
	addService('mySuperService', new MyService());
	/* passing a factory */
	addService('myOtherService', app => new OtherService(app));
})
```

## Using services in services

It is possible that you might need to use a service in another service. For
example, you might want to use a `logger` service that forwards errors to a log
aggregator. To do so must ensure that your plugin is initialized after the one
that registers the service you depend on, then you can access the services you
need from the application instance passed as parameter of the factory.

```js
import {definePlugin, addService, dependsOn} from '@zoram/core';
import MyService from './myService';
import OtherService from './otherService';
import {loggerPluginId} from './logger.plugin';

export default definePlugin('myPlugin', () => { // [!code focus:5]
	dependsOn(loggerPluginId);

	addService('myOtherService', ({services}) => new OtherService(services.logger));
})
```

## Using Typescript

module augmentation stuff