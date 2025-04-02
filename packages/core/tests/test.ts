import {definePlugin} from "../src/plugin";
import {dependsOn, onBeforeCreate, onCreated, onBeforeDestroy, addService, onEvent, Service} from "../src/plugins";

declare module '../src/application.ts' {
  interface ServiceCollection {
    woo?: Service<ServiceNotifications & {message: { msg }}>
    boris?: Service<ServiceNotifications & {message: { msg }}>
  }
}


export default definePlugin('bob', () => {
  dependsOn(billyPlugin); // if you know you'll be in the same bundle
  dependsOn(billyPlugin.id); // if you don't know

  // require the current plugin to be loaded after the given one if
  // it is in the application config, if not doesn't do anything.
  dependsOnOptional(borisPlugin); // might be a bad idea...
  dependsOn(borisPlugin, /* mandatory */ false); // might be a bad idea...
  dependsOn(borisPlugin, /* optional */ true); // might be a bad idea...

  addService(app => new myService(app.services.otherService));
  addService(new myService());

  onCreated(({services}) => {
    services.woo.registerSomething(something);
    services.boris?.registerBob();
  })

  onEvent(services => services.woo, 'before:create', console.log);
  onEvent(services.boris, 'before:create', console.log);

  onBeforeDestroy(app => {
    console.log("I'm dying");
    app.services.myService.empty();
  })
})


// setup
// => dependsOn
// => addService
// => addTopic ?
// onCreate
// [onInit]
// => onEvent
// onBeforeDestroy
// [onDestroy]
// => undo onEvent
