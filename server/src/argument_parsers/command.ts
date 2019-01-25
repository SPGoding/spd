import { ArgumentParser, Command, ArgumentParseResult, Argument, ParsingError } from '../parser'
import { commandTree } from '../server'
import { ArgumentType, CommandTreeNode } from '../utils/types'
import { combineLocalCaches } from '../utils/utils'
import { LiteralParser } from './literal'

/**
 * Parses a command.
 * Accepts comments (begin with `#`) and empty lines.
 */
export class CommandParser implements ArgumentParser {
    public parse(value: string) {
        const args: Argument[] = []
        const cmd: Command = { args, cache: {}, errors: [] }
        const ans: ArgumentParseResult = {
            argument: cmd, rest: '', cache: cmd.cache, errors: cmd.errors
        }

        if (value[0] === '#') {
            // TODO: #define #region support here.
            args.push({ type: 'comment', value: value } as Argument)
        } else if (/^\s*$/.test(value)) {
            args.push({ type: 'empty_line', value: value } as Argument)
        } else {
            const result = this.parseNodes(value, commandTree, args)
            ans.argument = result.argument
            combineLocalCaches(ans.cache, result.cache)
            ans.errors.push(...result.errors)
        }

        return ans
    }

    private getArgumentParser(parser: ArgumentType): ArgumentParser {
        switch (parser) {
            case 'command':
                return new CommandParser()
            case 'literal':
                return new LiteralParser()
            // TODO: Add more parsers here.
            default:
                throw `Unknown parser "${parser}"`
        }
    }

    public parseOneNode(value: string, node: CommandTreeNode, args: Argument[]): ArgumentParseResult {
        const parser = this.getArgumentParser(node.parser)
        const result = parser.parse(value)

        if (!containWtfError(result.errors)) {
            if (node.children) {
                const subResult = this.parseNodes(result.rest, node.children, args)
                combineLocalCaches(result.cache, subResult.cache)
                downgradeWtfErrors(subResult.errors)
                result.errors.push(...subResult.errors)
            }
        }

        return {
            argument: {
                cache: result.cache,
                errors: result.errors,
                args: [...args, result.argument]
            },
            rest: result.rest,
            cache: result.cache,
            errors: result.errors
        }
    }   

    public parseNodes(value: string, nodes: CommandTreeNode[], args: Argument[]): ArgumentParseResult {
        if (nodes.length === 1) {
            return this.parseOneNode(value, nodes[0], args)
        } else {
            for (const node of nodes) {
                const result = this.parseOneNode(value, node, args)
                if (!containWtfError(result.errors)) {
                    return result
                }
            }
            return {
                argument: {
                    type: 'error',
                    value: value
                },
                rest: '', cache: {},
                errors: [{
                    range: { start: 0, end: value.length },
                    message: 'Failed to match all nodes',
                    severity: 'wtf'
                }]
            }
        }
    }
}

/**
 * Whether the input parsing errors contain severity 'wtf'.
 * @param errors The parsing errors.
 */
function containWtfError(errors: ParsingError[]) {
    for (const error of errors) {
        if (error.severity === 'wtf') {
            return true
        }
    }

    return false
}

/**
 * Set all 'wtf' parsing errors to severity 'oops'.
 * @param errors The parsing errors.
 */
function downgradeWtfErrors(errors: ParsingError[]) {
    for (const error of errors) {
        if (error.severity === 'wtf') {
            error.severity = 'oops'
        }
    }
}
