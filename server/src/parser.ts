import { LocalCache, ArgumentType } from './utils/types'
import { NbtValue } from './argument_parsers/nbt_value'
import { Selector } from './argument_parsers/selector'
import { LiteralParserParams } from './argument_parsers/literal'

/**
 * Parse a function file.
 * @param content The content of the file.
 */
export function parseFunction(content: string) {
    const lines = content.split(/\r\n/g)
    const ans: Command[] = []

    for (const line of lines) {
        // ans.push(parseCommand(line))
    }

    return ans
}

/**
 * Represents a command.
 */
export interface Command {
    /**
     * All arguments of the command.
     */
    args: (Argument | NbtValue | Selector | Command)[]
    /**
     * The cache of the command.
     */
    cache: LocalCache
    /**
     * All errors of the command.
     */
    errors: ParsingError[]
}

/**
 * Represents a command argument.
 */
export interface Argument {
    /**
     * The type of the argument. 
     * @example
     * 'literal'
     * 'comment'
     */
    type: ArgumentType
    /**
     * The raw string of the argument. Shoudn't contain spaces at sides.
     */
    value: string
}

/**
 * Represents an error occurred when parsing a command.
 */
export interface ParsingError {
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
     * `oops`: We can guess out what it should be.
     * `wtf`: What the fucking string it is?!
     */
    severity: 'oops' | 'wtf'
}

export interface ArgumentParser {
    /**
     * Parse the input value as the argument.
     * @param input The input value.
     * @param params The parameters for the parser.
     */
    parse(input: string, params?: LiteralParserParams): ArgumentParseResult
}

export interface ArgumentParseResult {
    /**
     * The parsed argument result.
     */
    argument: Argument | NbtValue | Selector | Command
    /**
     * The rest value which the next argument parser should parse.
     */
    rest: string
    /**
     * Cache of the argument. Will be combined to `Command` which the argument belongs to.
     */
    cache: LocalCache
    /**
     * All errors eccured when parsing the argument. 
     * Will be combined to `Command` which the argument belongs to.
     */
    errors: ParsingError[]
}
