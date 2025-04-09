1. a service needs to be removed when the plugin that registered it is removed
2. a service needs to be easy to access from a dependent plugin
   1. using a service must require minimal boilerplate in a dependent plugin
   2. using a service must be dependency safe
   3. using a service must be flexible and as permissive as possible
3. a service must be strongly typed
4. a service can only be used in the plugin that registered it or in a plugin 
that depends on that first plugin
5. registering a service must fire an event so devtools and potential low level 
plugin can be informed of its existence
6. removing a service must fire an event so devtools and potential dependent 
plugins can be informed of its removal
7. a service must be scoped to an application instance
   1. service instances must not collide when used in different application
      instances of the same global context
   2. service instances must not be aware of each other if they are not part of 
      the same application context
8. the dependency between plugins and the use of exposed services must be clear
9. composition of services should be facilitated and inheritance avoided