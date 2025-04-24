import {getActivePlugin, type PluginId} from "./define-plugin";

/**
 * Mark the plugin as depending on the given dependency.
 * @param dependency the id of the other plugin you depend on. Make sure to have at least one import in your module
 * pointing to the dependency so typescript knows to load its types.
 *
 * @public
 */
export function dependsOn(dependency: PluginId): void {
  const activePlugin = getActivePlugin()

  if (!activePlugin) {
    if (import.meta.env.DEV) {
      console.warn(new Error("Invoked dependsOn with no activePlugin, dependsOn cannot be used outside of a plugin setup function"));
    }
    return;
  }

  if(activePlugin.phase !== 'setup') {
    if (import.meta.env.DEV) {
      console.warn(new Error("Invoked dependsOn outside of the setup phase, dependsOn cannot be used in hooks or outside of a plugin setup function"));
    }
    return;
  }

  activePlugin.dependencies.push(dependency);
  return;
}
