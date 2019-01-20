import { LocalCache } from './utils/types'
import { NbtValue } from './argument_parsers/nbt_value'
import { TargetSelector } from './argument_parsers/target_selector'

/**
 * Parse a function file.
 * @param content The content of the file.
 */
export function parseFunction(content: string) {
    const lines = content.split(/\r\n/g)
    const ans: Command[] = []

    for (const line of lines) {
        ans.push(parseCommand(line))
    }

    return ans
}

/**
 * Parse a command.
 * @param command A command (Can't begin with slash `/`). 
 * Accepts comments (begin with `#`) and empty lines.
 */
export function parseCommand(command: string) {
    const ans: Command = { args: [], cache: {} }
    const segments: string[] = []

    // TODO: Here.

    return ans
}

/**
 * Represents a command.
 */
export interface Command {
    /**
     * All arguments of the command.
     */
    args: (Argument | NbtValue | TargetSelector | Command)[]
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
    severity: 'error' | 'warning'
    /**
     * A human-readable message.
     */
    message: string
}

type ArgumentType = string | 'empty_line' | 'comment'

export interface ArgumentParser {
    parse(segments: string[], pos: number): ArgumentParseResult
}

export interface ArgumentParseResult {
    /**
     * Parsed argument object.
     */
    argument: Argument
    /**
     * The index of the segments where the next argument parser should start.
     */
    pos: number
    /**
     * Cache of the argument. Will be combined to `Command` which the argument belongs to.
     */
    cache?: LocalCache
    /**
     * All errors eccured when parsing the argument. 
     * Will be combined to `Command` which the argument belongs to.
     */
    errors?: ParsingError[]
}
