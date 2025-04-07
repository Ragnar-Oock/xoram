import mitt, {Emitter} from "mitt";
import {type Application} from "./application";


/**
 * Describes how a plugin is created.
 */
export type PluginSetup = () => void;
/**
 * Implements life cycles for the plugin.
 *
 * @todo figure out the parameters to pass in and clean up declaration
 */
export type PluginHook = (app: Application) => void;
export type PluginId = symbol;


/**
 * @internal used internally to manage plugin life cycle.
 */
export type PluginHooks = {
  /**
   * Fires at the start of the instantiation of the plugin.
   * First hook called in the life cycle of the plugin, right after dependency resolution is done.
   *
   * @see onBeforeCreate
   */
  beforeCreate: Application;
  /**
   * Fires once the `onBeforeCreate` hook of all the plugin of a batch have been called.
   * At that point all services you might depend on have been registered.
   *
   * @see onCreated
   */
  created: Application;
  /**
   * Fires before a plugin is removed from the application.
   *
   * @see onBeforeDestroy
   */
  beforeDestroy: Application;
  /**
   * Fires after a plugin is removed from the application.
   * @internal
   */
  destroyed: Application;
}

export type DefinedPlugin = {
  /**
   * Identifies a plugin in an application.
   * It is used internally to resolve dependencies between plugins.
   */
  id: PluginId;
  /**
   * List the other plugins that should be initialized before this one, if they are not part of the
   * application config, the application will not instantiate.
   */
  dependencies: (DefinedPlugin | DefinedPlugin['id'])[];

  hooks: Emitter<PluginHooks>
}

let activePlugin: DefinedPlugin | undefined;

const setActivePlugin = (plugin?: DefinedPlugin) => activePlugin = plugin;
export const getActivePlugin = () => activePlugin;

export function definePlugin(id: symbol, setup: PluginSetup): () => DefinedPlugin {
  return () => {
    const plugin = {
      id,
      dependencies: [],
      hooks: mitt(),
    } satisfies DefinedPlugin;

    setActivePlugin(plugin);
    try {
      setup();
    }
    catch (error) {
      // todo handle this error better ?
      throw new Error(`Error in setup function of plugin "${String(id)}"`, {cause: error as Error});
    }
    finally {
      setActivePlugin();
    }

    return plugin;
  }
}
