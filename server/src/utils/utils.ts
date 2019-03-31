import { LocalCache, DefinitionType } from './types'
import { CompletionItem } from 'vscode-languageserver'

/**
 * Combines two local caches.
 * @param origin The origin cache. Will be overriden by `override`.
 * @param override The override cache.
 */
export function combineLocalCaches(origin: LocalCache, override: LocalCache) {
    if (origin.definitions && override.definitions) {
        for (const key of ['name', 'tag', 'sound']) {
            if (origin.definitions[key] && override.definitions[key]) {
                origin.definitions[key].push(...override.definitions[key])
            } else {
                origin.definitions[key] = override.definitions[key]
            }
        }
    } else {
        origin.definitions = override.definitions
    }

    if (origin.references && override.references) {
        for (const key of [
            'name',
            'tag',
            'sound',
            'advancement',
            'recipe',
            'loot_table',
            'function',
            'block_tag',
            'entity_type_tag',
            'fluid_tag',
            'function_tag',
            'item_tag'
        ]) {
            if (origin.references[key] && override.references[key]) {
                origin.references[key].push(...override.references[key])
            } else {
                origin.references[key] = override.references[key]
            }
        }
    } else {
        origin.references = override.references
    }
}

/**
 * Convert a string array to a string which connects each element with a comma and the last element with word 'or'.
 * @param array The input string array.
 */
export function convertArrayToString(array: string[]) {
    array.sort()
    if (array.length <= 1) {
        return `'${array[0]}'`
    } else if (array.length === 2) {
        return `'${array[0]}' or '${array[1]}'`
    } else {
        const beginning = `'${array.slice(0, -1).join("', '")}'`
        return `${beginning} or '${array.slice(-1)[0]}'`
    }
}
