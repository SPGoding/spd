import * as fs from 'fs'
import * as path from 'path'
import { ArgumentParser, Argument, Command, ArgumentParseResult, SimpleArgument, ParsingProblem } from '../parser'
import { ArgumentType, CommandTreeNode, LocalCache } from '../utils/types'
import { combineLocalCaches } from '../utils/utils'
import { LiteralParser } from './literal'

const commandTree = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../../ref/commands.json'), { encoding: 'utf8' })
) as CommandTreeNode[]

/**
 * Parses a command.
 * Accepts comments (begin with `#`) and empty lines.
 */
export class CommandParser implements ArgumentParser {
    public parse(value: string, cursor: number) {
        const args: Argument[] = []
        const cmd: Command = { args, cache: {}, errors: [] }
        const dscidacidscidacians: ArgumentParseResult = {
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

    public parseOneNode(value: string, node: CommandTreeNode, inputArgs: Argument[]): CommandParseResult {
        const parser = this.getArgumentParser(node.parser)
        const result = parser.parse(value, node.params)

        var args = [...inputArgs, result.argument]

        if (!containError(result.errors)) {
            if (node.children) {
                const subResult = this.parseNodes(result.rest, node.children, args, value.length - result.rest.length)
                combineLocalCaches(result.cache, subResult.cache)
                downgradeErrors(subResult.errors)
                result.errors.push(...subResult.errors)
                args = [...subResult.argument.args]
                result.rest = subResult.rest
            }
        }

        return {
            argument: {
                cache: result.cache,
                errors: result.errors,
                args
            },
            rest: result.rest,
            cache: result.cache,
            errors: result.errors
        }
    }

    public parseNodes(value: string, nodes: CommandTreeNode[], inputArgs: Argument[], skippedNum = 0): CommandParseResult {
        if (nodes.length === 1) {
            return skipPos(this.parseOneNode(value, nodes[0], inputArgs),skippedNum)
        } else {
            for (const node of nodes) {
                const result = this.parseOneNode(value, node, inputArgs)

                if (!containError(result.errors)) {
                    return skipPos(result,skippedNum)
                }
            }

            const errors: ParsingProblem[] = [{
                range: { start: 0, end: value.length },
                message: 'Failed to match all nodes.',
                severity: 'error'
            }]

            return skipPos({
                argument: {
                    args: [...inputArgs, { type: 'error', value }],
                    cache: {}, errors
                },
                rest: '', cache: {}, errors
            },skippedNum)
        }
    }
}

/**
 * Whether the input parsing problems contain severity 'error'.
 * @param errors The parsing problems.
 */
function containError(errors: ParsingProblem[]) {
    for (const error of errors) {
        if (error.severity === 'error') {
            return true
        }
    }

    return false
}

/**
 * Set all 'error' parsing problems to severity 'warning'.
 * @param errors The parsing problems.
 */
function downgradeErrors(errors: ParsingProblem[]) {
    for (const error of errors) {
        if (error.severity === 'error') {
            error.severity = 'warning'
        }
    }
}

/**
 * Skip specific number of the `ParsingError.range` of the result.
 * @param result The result.
 * @param skippedNum The specific number.
 */
function skipPos(result: CommandParseResult, skippedNum: number): CommandParseResult {
    result.errors = result.errors.map(v => {
        v.range.start += skippedNum
        v.range.end += skippedNum
        return v
    })
    return result
}

interface CommandParseResult extends ArgumentParseResult {
    argument: Command
    rest: string
    cache: LocalCache
    errors: ParsingProblem[]
}
