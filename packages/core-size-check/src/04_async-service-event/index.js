import {addService, asyncPlugin, createApp, definePlugin, defineService} from "@zoram/core";


export const pluginB = definePlugin(()=>{
    addService('service', defineService())
});
let res;
createApp([
    pluginB,
    asyncPlugin(
        async () => ([( await import('./plugin-a.js')).default]),
        () => new Promise(resolve => res = resolve))
]);

res();