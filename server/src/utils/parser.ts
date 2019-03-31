import { LocalCache, ArgumentType } from './types'
import { NbtValue } from '../parsers/nbt'
import { Selector } from '../parsers/selector'
import { CompletionItem } from 'vscode-languageserver'

/**
 * Represents an argument.
 */
export interface Argument {
    /**
     * The type of the argument.
     */
    type: ArgumentType
    /**
     * The raw string of the argument. Shoudn't contain spaces at sides.
     */
    value: string
    /**
     * Additional data for complex arguments.
     */
    data?: NbtValue | Selector
}

/**
 * Represents a thrown problem while parsing a command.
 */
export interface ParsingProblem {
    /**
     * The range of the error: [start, end).
     */
    range: {
        start: number
        end: number
    }
    /**
     * A human-readable message.
     */
    message: string
    /**
     * The severity of the error.
     * `info`: Could parse, but it may not work as user's expectation.
     * `warning`: Failed to parse, though we can guess out what it should be.
     * `error`: Failed to parse. What the fucking string it is?!
     */
    severity: 'info' | 'warning' | 'error'
}

export interface Parser {
    /**
     * Parse the input value as the argument.
     * @param input The input value.
     * @param params The parameters for the parser.
     */
    parse(input: string, params?: object): ParsedResult
}

export interface ParsedResult {
    /**
     * The parsed argument result.
     */
    result: Argument
    /**
     * The rest value which the next argument parser should parse.
     */
    rest: string
    /**
     * Cache of the argument. Will be combined to `Command` which the argument belongs to.
     */
    cache?: LocalCache
    /**
     * All errors eccured when parsing the argument. 
     * Will be combined to `Command` which the argument belongs to.
     */
    problems?: ParsingProblem[]
    /**
     * All possible completions that can be applied at the end of the input string.
     */
    completions?: CompletionItem[]
}
