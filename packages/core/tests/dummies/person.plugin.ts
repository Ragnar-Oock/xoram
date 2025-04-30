import type { Service, ServiceNotifications } from '../../src';
import { addService, definePlugin } from '../../src';
import { emitter } from '../../src/emitter';

export type Person = {
    name: string;
    age: number;
}
export interface PersonServiceNotifications extends ServiceNotifications {
    before_add: {person: Person};
    after_add: {person: Person};
}

function personService(): PersonService {
    const persons: Record<string, Person> = {};
    return {
        emitter: emitter<PersonServiceNotifications>(),
        add(person: Person) {
            persons[person.name] = person;
            return this;
        },
        remove(name: string) {
            delete persons[name];
            return this;
        },
        get list() {
            return new Proxy(persons, {
                set(): boolean {
                    return false;
                }
            });
        }
    }
}

export interface PersonService extends Service<PersonServiceNotifications> {
    add(person: Person): this;
    remove(name: string): this;
    readonly list: Record<string, Person>;
}


export const personPluginId = Symbol('person-plugin');
export const personServiceId = Symbol('person-service');

declare module '../../src' {
    interface ServiceCollection {
        [personServiceId]: PersonService;
        // person: PersonService;
    }
}
export default definePlugin(personPluginId, () => {
    addService(personServiceId, personService());


})