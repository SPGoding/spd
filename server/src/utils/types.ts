import { Range } from 'vscode-languageserver'

/**
 * Caches for making renaming faster.
 * Stored in each function's tree.
 * @see WorkspaceCache
 */
export type LocalCache = {
    /**
     * All references.
     * @example
     * "/summon minecraft:armor_stand ~ ~ ~ {Tags:[foo,bar]}"
     * =>
     * {
     *  tag: {
     *  }
     * }
     */
    references?: { 
        tag: {
            [tag: string]: Range
        }
    }
}

/**
 * Caches for making renaming faster.
 * Stored in workspace's cache directory.
 * @see LocalCache
 */
export type WorkspaceCache = {
    [type in ResourceLocationType]?: {
        [id: string]: {
            /**
             * The URI of the file which matches the resource location.
             */
            definition: string
            /**
             * URIs of all files that reference this data.
             */
            references: string[]
        }
    }
}

/**
 * All possible types of a resource location.
 */
export type ResourceLocationType =
    | 'advancement'
    | 'recipe'
    | 'loot_table'
    | 'function'
    | 'block_tag'
    | 'entity_type_tag'
    | 'fluid_tag'
    | 'function_tag'
    | 'item_tag'
export const ResourceLocationTypes: ResourceLocationType[] = [
    'advancement',
    'recipe',
    'loot_table',
    'function',
    'block_tag',
    'entity_type_tag',
    'fluid_tag',
    'function_tag',
    'item_tag'
]

/**
 * All possible types of a comment definition.
 * `name` stands for fake names of scoreboards.
 * `tag` stands for an entity tag.
 * `sound` stands for an resource pack custom sound event.
 */
export type DefinitionType = 'name' | 'tag' | 'sound'
export const DefinitionTypes: DefinitionType[] = ['name', 'tag', 'sound']

/**
 * All possible command argument types.
 */
export type ArgumentType =
    | ResourceLocationType
    | DefinitionType
    | 'literal'
    | 'string'
    | 'number'
    | 'boolean'
    | 'comment'
    | 'empty_line'
    | 'error'
    | 'vector'
    | 'command'
    | 'nbt_path'
    | 'nbt_value'
    | 'target_selector'
    | 'comment_definition'
    | 'slot'
    | 'mode'
    | 'color'
    | 'bossbar'
export const ArgumentTypes: ArgumentType[] = [
    ...ResourceLocationTypes,
    ...DefinitionTypes,
    'literal',
    'string',
    'number',
    'boolean',
    'comment',
    'empty_line',
    'error',
    'vector',
    'command',
    'nbt_path',
    'nbt_value',
    'target_selector',
    'comment_definition',
    'slot',
    'mode',
    'color',
    'bossbar'
]

/**
 * A command tree node stored in commands.json.
 */
export interface CommandTreeNode {
    /**
     * The parser to use.
     */
    parser?: ArgumentType
    /**
     * The template to use.
     */
    template?: string
    /**
     * All parameters for the parser.
     */
    params?: object
    /**
     * Human-readable command/argument description.
     * Expects a long sentense for the first node of each command to describe the command,
     * and a short description for non-string parameters.
     */
    description?: string
    /**
     * All children of the command node.
     */
    children?: CommandTreeNode[]
    /**
     * Whether the command is executable.
     */
    executable?: boolean
}

/**
 * The structure of commands.json.
 */
export interface CommandTree {
    commands: CommandTreeNode[]
    templates: {
        [name: string]: Template
    }
}

/**
 * An template defined in commands.json.
 */
export type Template = CommandTreeNode | CommandTreeNode[]
