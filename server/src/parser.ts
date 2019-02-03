import { LocalCache, ArgumentType } from './utils/types'
import { NbtValue } from './argument_parsers/nbt_value'
import { Selector } from './argument_parsers/selector'
import { CompletionList } from 'vscode-languageserver'

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
    args: Argument[]
    /**
     * The cache of the command.
     */
    cache: LocalCache
    /**
     * All errors of the command.
     */
    errors: ParsingProblem[]
}

/**
 * Represents a command argument.
 */
export interface SimpleArgument {
    /**
     * The type of the argument.
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
     * `info`: Could parse, but it may not work as expectation.
     * `warning`: Failed to parse, though we can guess out what it should be.
     * `error`: Failed to parse. What the fucking string it is?!
     */
    severity: 'info' | 'warning' | 'error'
}

export interface ArgumentParser {
    /**
     * Parse the input value as the argument.
     * @param input The input value.
     * @param cursor The location of the cursor. Should be undefined when cursor is
     * not in the range of the input string.
     * @param params The parameters for the parser.
     */
    parse(input: string, cursor: number | undefined, params?: object): ArgumentParseResult
}

export interface ArgumentParseResult {
    /**
     * The parsed argument result.
     */
    argument: Argument
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
    errors: ParsingProblem[]
    /**
     * All possible completions at the cursor location.
     */
    completions?: CompletionList
}

export type Argument = SimpleArgument | NbtValue | Selector | Command
