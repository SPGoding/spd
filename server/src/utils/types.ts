import { Range, Location } from 'vscode-languageserver'

/**
 * Caches for making renaming faster.
 * Stored in each function's abstract syntax tree.
 * @see WorkspaceCache
 */
export type LocalCache = {
    /**
     * All definitions.
     * @example
     * "#define tag foo"
     * =>
     * { tag: ['foo'] }
     */
    definitions?: {
        [type in DefinitionType]?: string[]
    },
    /**
     * All references.
     * @example
     * "/summon minecraft:armor_stand ~ ~ ~ {Tags:[foo,bar]}"
     * =>
     * { tag: ['foo', 'bar'] }
     */
    references?: {
        [type in DefinitionType | ResourceLocationType]?: string[]
    }
}

/**
 * Caches for making renaming faster.
 * Stored in workspace's cache directory.
 * @see LocalCache
 */
export type WorkspaceCache = {
    [type in ResourceLocationType | DefinitionType]?: {
        [id: string]: {
            /**
             * The file contains the definition (for `DefinitionType`), 
             * or the file matched the resource location (for `ResourceLocationType`).
             */
            uri: string,
            /**
             * The definition range (for `DefinitionType`). 
             * Shouldn't exist for `ResourceLocationType`.
             */
            range?: Range,
            /**
             * URIs of all files which have reference this data.
             */
            references: string[]
        }
    }
}

/**
 * All possible types of a resource location.
 */
type ResourceLocationType = 'advancement' | 'recipe' | 'loot_table' | 'function'
/**
 * All possible types of a comment definition.
 */
type DefinitionType = 'name' | 'tag'
