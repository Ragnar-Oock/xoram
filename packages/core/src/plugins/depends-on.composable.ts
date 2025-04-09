import {getActivePlugin, type PluginId} from "./define-plugin";

/**
 * Mark the plugin as depending on the given dependency.
 * @param dependency the id of the other plugin you depend on. Make sure to have at least one import in your module
 * pointing to the dependency so typescript knows to load its types.
 *
 * @public
 */
export function dependsOn(dependency: PluginId): void;
/**
 * Mark the plugin as depending on the given dependency.
 * @param dependency the other plugin you depend on, can be an id or a fully resolved plugin. If you
 * are using an id make sure to have at least one import in your module pointing to the dependency
 * so typescript knows to load its types.
 * @param _activePlugin the current plugin, automatically injected if you are in a plugin setup
 * function, you will need to provide it yourself in other context, this is an escape hatch used for
 * testing or build time extension, you should not need to use it.
 *
 * @internal use the public override
 */
export function dependsOn(dependency: DefinedPlugin | PluginId, _activePlugin = getActivePlugin()): void {
  if (!_activePlugin) {
    if (import.meta.env.DEV) {
      console.warn(new Error("Invoked dependsOn with no activePlugin"));
    }
    return;
  }

  _activePlugin.dependencies.push(dependency);
  return;
}
