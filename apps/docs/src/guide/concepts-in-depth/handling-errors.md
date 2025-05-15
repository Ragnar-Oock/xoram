# Handling errors

Errors in plugin code can cause more than just a bad time — they can block
plugins from loading properly, stop your whole app from initializing, or even
trigger a cascade of failures if they happen inside an event listener. For
example, if a plugin throws during setup, that plugin might never finish
loading. Worse, if the error happens during a critical lifecycle hook, it could
halt the entire app. And if the error bubbles up through a chain of event
listeners, one bad plugin can end up affecting others in unpredictable ways.

To help avoid all that, the zoram automatically catches errors at the boundaries
of each hook and event listener registered via `onEvent`. That way, a failure in
one plugin doesn’t take everything else down with it. However, it means that if
an error occurred it might have left the plugin it originated from in a bad
state, so you should not rely on this mechanism too much, it's there to catch
you if you fall but should not be your only line of defence.

## Dealing with errors

While you have the insurance that no error can bring down you whole application
you might want to be informed that they happened to fix them down the line. To
that end you can add to your application config a `onError` function that will
be called when the application instance catches an error.

```ts
import { createApp } from "@zoram/core";

createApp([ /* your plugins go here */ ], { // [!code focus:5]
	onError: error => {
		/* send the error to your error/log agregator */
	}
})
```