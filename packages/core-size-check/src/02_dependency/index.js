import {createApp, definePlugin, dependsOn} from "@zoram/core";

const pluginA = definePlugin(()=>{
    dependsOn(pluginB.id);
});
const pluginB = definePlugin(()=>{});
createApp([pluginB, pluginA]);