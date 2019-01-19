import { LocalCache } from './utils/types'

/**
 * Parse a function file.
 * @param content The content of the file.
 */
export function parseFunction(content: string) {
    const lines = content.split(/\n/g)
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
function parseCommand(command: string) {
    const ans: Command = { args: [], cache: {} }

    // TODO: Here.

    return ans
}

/**
 * Represents a command.
 */
interface Command {
    /**
     * All arguments of the command.
     */
    args: Argument[]
    /**
     * The cache of the command.
     */
    cache: LocalCache
}

/**
 * Represents a command argument.
 */
interface Argument {
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
    /**
     * All errors of the argument.
     */
    errors: ParsingError[]
    /**
     * The data of the argument. Used by complex arguments such as NBTs and target selectors.
     */
    data?: object
    /**
     * The cache of the argument.
     */
    cache: LocalCache
}

/**
 * Represents an error occurred when parsing a command.
 */
interface ParsingError {
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
