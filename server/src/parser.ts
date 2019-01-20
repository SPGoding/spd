import { LocalCache, ArgumentType } from './utils/types'
import { NbtValue } from './argument_parsers/nbt_value'
import { Selector } from './argument_parsers/selector'

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
    cache?: LocalCache
    /**
     * All errors of the argument.
     */
    errors?: ParsingError[]
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
}

export interface ArgumentParser {
    /**
     * Parse the value as the argument.
     * @param value The value.
     */
    parse(value: string): ArgumentParseResult
}

export interface ArgumentParseResult {
    /**
     * Arguments after parsing the value.
     */
    arguments: (Argument | NbtValue | Selector | Command)[]
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
