import {definePlugin, dependsOn, onCreated, useService} from "../../src";
import {personPluginId, personServiceId} from "./person.plugin";

export const borisPluginId = Symbol('boris-plugin');
export default definePlugin(borisPluginId, () => {
    dependsOn(personPluginId);

    onCreated(app => {
        const person = useService(personServiceId);
        person.add({name: 'billy', age: 13})

        app.services[personServiceId].add({name: 'boris', age: 42})

        person.add({name: 'dudule', age: 978});
    })
})