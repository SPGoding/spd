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
    data?: NbtValue | Selector | Argument[]
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

export abstract class Parser {
    /**
     * The id of the current parser.
     */
    public static id: string

    /**
     * Constructs a parser class.
     * @param params The parameters for the parser.
     */
    public constructor(private readonly params?: object) { }

    /**
     * Parse the input value as the argument.
     * @param input The input value.
     * @param index The index where the parsing should begin.
     */
    public abstract parse(input: string, index: number): ParsedResult

    public toString() {
        const attributes: string[] = []
        for (const key in this.params) {
            attributes.push(`${key}=${this.params[key]}`)
        }

        if (attributes.length > 0) {
            return `${Parser.id}[${attributes.join(',')}]`
        } else {
            return Parser.id
        }
    }
}

export interface ParsedResult {
    /**
     * The parsed argument result.
     */
    argument: Argument
    /**
     * The end index of the parsing.
     * Next parser should begin at endIndex + 1.
     */
    endIndex: number
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
