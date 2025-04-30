import { warn } from '../warn.helper';
import { getActivePlugin } from './active-plugin';
import type { PluginId } from './plugin.type';

/**
 * Mark the plugin as depending on the given dependency.
 * @param dependency the id of the other plugin you depend on. Make sure to have at least one import in your module
 * pointing to the dependency so typescript knows to load its types.
 *
 * @public
 */
export function dependsOn(dependency: PluginId): void {
  const activePlugin = getActivePlugin()

  if (!activePlugin || activePlugin.phase !== 'setup') {
    if (import.meta.env.DEV) {
      warn(new Error("Invoked dependsOn outside of a plugin's setup function, dependsOn can't be used in hooks or outside of a plugin setup function."));
    }
    return;
  }

  activePlugin.dependencies.push(dependency);
  return;
}
