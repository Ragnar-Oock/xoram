# Listening to events

While services allow plugins to expose logic and data between themselves, events
are how plugins are notified that something happened in one of their 
dependencies.

[//]: # (## Why listen to events ?)

[//]: # ()
[//]: # (If you have read the [Services Essentials]&#40;../essentials/services&#41;, you might be)

[//]: # (asking yourself :)

[//]: # ()
[//]: # (_If we can already expose methods to other plugins via services why would we )

[//]: # (need events ?_)

[//]: # ()

# Why use events instead of methods ?


Using events allows you to leverage the [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
when defining your plugins. Let's say we have the following setup :

- `PersonPlugin` that registers a `person` service that tracks a list of persons
- `NewPersonToastPlugin` that shows a notification to the user when a person is
registered in the `person` service via a `toast` service
- `PersonRemovedMailPlugin` that send a mail when a person is removed from the
`person` service
- `SyncPersonWithServerPlugin` that keeps the list of persons in the service in
sync with a server backup


Without using events we would need to have the `PersonPlugin` call a method of 
the `toast` service added by `NewPersonToastPlugin` whenever `SyncPersonWithServerPlugin`
adds a person to the list. We would have a dependency graph looking like :

- `PersonPlugin` depends on `NewPersonToastPlugin`
- `SyncPersonWithServerPlugin` depends on `PersonPlugin`
- `NewPersonToastPlugin` depends on nothing (assuming the `toast` service does
not use types coming from the `person` service)


```
SyncPersonWithServerPlugin
└─▶ depends on PersonPlugin
    ├─▶ depends on NewPersonToastPlugin
    └─▶ depends on PersonRemovedMailPlugin
```

If at a latter date we need to add a mail notification via a `mail` service when
a person is removed from the service we would need to add another dependency to
`PersonPlugin`. The issue here is that we would directly reference the `mail` 
and `toast` services and their methods, leading to strong coupling between our
plugins.

Events allow us to reverse the dependencies of `PersonPlugin` so that it does
not need to know if something happens when a person is added or removed from its
internal list. By emitting an event when a person is added and one where the 
person is removed it's possible to implement the logic of `NewPersonToastPlugin`
and `PersonRemovedMailPlugin` without having any strong connexion between them
make it possible to remove one or the other if they are not needed

The dependency graph would then look like :
```
SyncPersonWithServerPlugin
└─▶ depends on PersonPlugin

NewPersonToastPlugin
└─▶ depends on PersonPlugin

PersonRemovedMailPlugin
└─▶ depends on PersonPlugin
```

## Adding a listener

Event listeners are added with the `onEvent` function it has 