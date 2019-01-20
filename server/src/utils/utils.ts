import { LocalCache, DefinitionType } from './types'

/**
 * Combines two local caches.
 * @param origin The origin cache. Will be overriden by `override`.
 * @param override The override cache.
 */
export function combineLocalCaches(origin: LocalCache, override: LocalCache) {
    for (const key of ['name', 'tag', 'sound']) {
        origin.definitions[key].push(...override.definitions[key])
    }
    for (const key of ['name', 'tag', 'sound', 'advancement', 'recipe', 'loot_table',
        'function', 'block_tag', 'entity_type_tag', 'fluid_tag', 'function_tag', 'item_tag']) {
        origin.references[key].push(...override.references[key])
    }
}
