import type { DefinedPlugin, PluginId } from './plugin.type';

// region plugin sort
export type PluginSortingResult = Readonly<[
	/**
	 * The sorted list of plugins
	 */
	sorted: DefinedPlugin[],
	/**
	 * The sorting wasn't aborted.
	 */
	aborted: false,
] | [
	/**
	 * Empty array to avoid fallbacks all over the place.
	 */
	sorted: never[],
	/**
	 * The reason why the sorting was aborted.
	 */
	aborted: Error,
]>

/**
 * Topologically sort plugins by their dependencies.
 * @param plugins plugins to sort by dependencies
 * @param existingPlugins plugins to consider already registered, those plugins can be used as dependencies by the
 *   plugins from `plugin`
 *
 * @internal
 */
export function sortPluginsByDependencies(
	plugins: DefinedPlugin[],
	existingPlugins?: Map<PluginId, DefinedPlugin>,
): PluginSortingResult {
	const sorted: DefinedPlugin[] = [];
	const unmarked: DefinedPlugin[] = [ ...plugins ];
	const map = new Map<PluginId, DefinedPlugin>(existingPlugins?.entries());
	const temporarilyMarked = new Set<PluginId>();
	const permanentlyMarked = new Set<PluginId>(map.keys());

	let aborted: false | Error = false;

	unmarked.forEach(plugin => map.set(plugin.id, plugin));

	/**
	 * @param plugin the plugin to check dependencies of
	 */
	function visit(plugin: DefinedPlugin): void {
		const pluginId = plugin.id;
		if (permanentlyMarked.has(pluginId)) {
			return;
		}
		if (temporarilyMarked.has(pluginId)) {
			// todo list dependency cycle
			aborted = new Error(`The plugin "${ String(pluginId) }" declares a dependency that directly or indirectly depends on it.`);
			return;
		}
		temporarilyMarked.add(pluginId);
		for (const dependencyId of plugin.dependencies) {
			const dependency = map.get(dependencyId);

			if (!dependency) {
				aborted = new Error(`The plugin "${ String(pluginId) }" depends on "${ String(dependencyId) }" but it is not in the list of provided plugins. Did you forget to register it ?`);
				break;
			}

			visit(dependency);
		}
		temporarilyMarked.delete(pluginId);
		permanentlyMarked.add(pluginId);
		sorted.push(plugin);
	}

	for (const definedPlugin of unmarked) {
		visit(definedPlugin);
	}

	return [
		sorted,
		aborted,
	] as Readonly<PluginSortingResult>;
}