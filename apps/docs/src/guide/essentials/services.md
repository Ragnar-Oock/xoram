# Services

Services are the public API of a plugin, they allow you to expose logic and 
state to other plugins in a controlled manner.

## Structure

A service at it's simplest is an object with an `emitter` that can broadcast 
events for plugins to subscribe to. Such barebones services can be referred to as
`topics` because they only serve as hubs for events that can come from a plugin's
logic or from external libraries you might expose the life cycle of.
