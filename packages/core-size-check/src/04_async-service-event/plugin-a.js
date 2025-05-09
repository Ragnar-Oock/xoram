import {pluginB} from "./index.js";
import {definePlugin, dependsOn, onEvent} from "@zoram/core";

export default definePlugin(()=>{
    dependsOn(pluginB.id);
    onEvent('service', '*', console.log);
});