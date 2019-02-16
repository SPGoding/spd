import { Range } from 'vscode-languageserver'

/**
 * Caches for making renaming faster.
 * Stored in each function's tree.
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
        [type in DefinitionType]?: {
            id: string,
            description?: string
        }[]
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
            definition: {
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
            },
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
export type ResourceLocationType =
    | 'advancement' | 'recipe' | 'loot_table' | 'function' | 'block_tag'
    | 'entity_type_tag' | 'fluid_tag' | 'function_tag' | 'item_tag'
export const ResourceLocationTypes: ResourceLocationType[] = [
    'advancement', 'recipe', 'loot_table', 'function', 'block_tag',
    'entity_type_tag', 'fluid_tag', 'function_tag', 'item_tag'
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
/*
 * TODO: Parsers
 * nbt_path target_selector ResourceLocationTypes DefinitionTypes
 */
export type ArgumentType =
    | ResourceLocationType | DefinitionType | 'literal' | 'string' | 'number' | 'boolean' | 'comment' | 'empty_line' | 'error' | 'vector' | 'command' | 'nbt_path' | 'nbt_value' | 'target_selector' | 'comment_definition' | 'slot' | 'mode' | 'color' | 'bossbar'
export const ArgumentTypes: ArgumentType[] = [
    ...ResourceLocationTypes, ...DefinitionTypes, 'literal', 'string', 'number', 'boolean', 'comment', 'empty_line',
    'error', 'vector', 'command', 'nbt_path', 'nbt_value', 'target_selector', 'comment_definition', 'slot', 'mode', 'color', 'bossbar'
]

/**
 * A command tree node stored in commands.json.
 */
export interface CommandTreeNode {
    /**
     * The parser to use.
     */
    parser?: ArgumentType,
    /**
     * The definition to use.
     */
    definition?: string,
    /**
     * All parameters for the parser.
     */
    params?: object,
    /**
     * Human-readable command/argument description.
     * Expects a long sentense for the first node of each command to describe the command,
     * and a short description for non-string parameters.
     */
    description?: string,
    /**
     * All children of the command node.
     */
    children?: CommandTreeNode[],
    /**
     * Whether the command is executable.
     */
    executable?: boolean
}

/**
 * The structure of commands.json.
 */
export interface CommandTree {
    commands: CommandTreeNode[],
    templates: Template[]
}

/**
 * An template defined in commands.json.
 */
export interface Template {
    [name: string]: CommandTreeNode | CommandTreeNode[]
}
