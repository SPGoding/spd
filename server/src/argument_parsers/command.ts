import * as fs from 'fs'
import * as path from 'path'
import { ArgumentParser, Argument, Command, ArgumentParseResult, SimpleArgument, ParsingProblem } from '../parser'
import { ArgumentType, CommandTreeNode, LocalCache, DefinitionTypes } from '../utils/types'
import { combineLocalCaches, convertArrayToString } from '../utils/utils'
import { LiteralParser } from './literal'
import { CompletionItem } from 'vscode-languageserver'

const commandTree = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../../ref/commands.json'), { encoding: 'utf8' })
) as CommandTreeNode[]

/**
 * Parses a command.
 * Accepts comments (begin with `#`) and empty lines.
 */
export class CommandParser implements ArgumentParser {
    public parse(value: string, cursor: number | undefined) {
        const args: Argument[] = []
        const cmd: Command = { args, cache: {}, errors: [] }
        const completions: CompletionItem[] = []
        const ans: ArgumentParseResult = {
            argument: cmd, rest: '', cache: cmd.cache,
            errors: cmd.errors, completions
        }

        if (value[0] === '#') {
            // Completion
            if (value.length === 1 && cursor === 1) {
                completions.push(CompletionItem.create('define'))
                completions.push(CompletionItem.create('region'))
            }

            // Further suppoer.
            if (value.slice(0, 8) === '#define ') {
                // Completion.
                if (value.length === 8 && cursor === 8) {
                    const cpls = DefinitionTypes.map(v => CompletionItem.create(v))
                    completions.push(...cpls)
                }
                // Parsing.
                const segments = value.split(/\s/g)
                ans.cache.definitions = {}
                switch (segments[1]) {
                    case 'name':
                    case 'tag':
                    case 'sound':
                        if (segments.length === 3) {
                            ans.cache.definitions[segments[1]] = [{
                                id: segments[2]
                            }]
                        } else if (segments.length >= 4) {
                            ans.cache.definitions[segments[1]] = [{
                                id: segments[2],
                                description: segments[3]
                            }]
                        }
                        break
                    default:
                        ans.errors.push({
                            severity: 'warning',
                            range: { start: 8, end: segments[1].length + 8 },
                            message: `Expected ${
                                convertArrayToString(DefinitionTypes)
                                } but got '${segments[1]}'.`
                        })
                        break
                }
                args.push({ type: 'comment_definition', value: value } as Argument)
            } else if (value.slice(0, 8) === '#region ') {
                // TODO: #region support here.
            } else {
                args.push({ type: 'comment', value: value } as Argument)
            }
        } else if (/^\s*$/.test(value)) {
            args.push({ type: 'empty_line', value: value } as Argument)
        } else {
            const result = this.parseNodes(value, commandTree, args, 0, cursor)
            ans.argument = result.argument
            combineLocalCaches(ans.cache, result.cache)
            ans.errors.push(...result.errors)
        }

        return ans
    }

    private getArgumentParser(parser: ArgumentType): ArgumentParser {
        switch (parser) {
            case 'boolean':
                return new LiteralParser({ expected: ['false', 'true'] })
            case 'command':
                return new CommandParser()
            case 'literal':
                return new LiteralParser()
            case 'mode':
                return new LiteralParser({
                    expected: [
                        'adventure', 'creative', 'spectator', 'survival'
                    ]
                })
            // TODO: Add more parsers here.
            default:
                throw `Unknown parser "${parser}"`
        }
    }

    public parseOneNode(value: string, node: CommandTreeNode, inputArgs: Argument[],
        addedNum: number, cursor: number | undefined): CommandParseResult {
        const parser = this.getArgumentParser(node.parser)
        const result = parser.parse(value, cursor, node.params)

        var args = [...inputArgs, result.argument]

        if (!containError(result.errors)) {
            if (node.children) {
                const addedNum = value.length - result.rest.length
                const subResult = this.parseNodes(result.rest, node.children, args, addedNum,
                    cursor !== undefined ? cursor - addedNum : undefined)
                combineLocalCaches(result.cache, subResult.cache)
                downgradeErrors(subResult.errors)
                result.errors.push(...subResult.errors)
                args = [...subResult.argument.args]
                result.rest = subResult.rest
            }
        }

        const ans = {
            argument: {
                cache: result.cache,
                errors: result.errors,
                args
            }, rest: result.rest, cache: result.cache, errors: result.errors
        }

        return addPos(ans, addedNum)
    }

    public parseNodes(value: string, nodes: CommandTreeNode[], inputArgs: Argument[],
        addedNum: number, cursor: number | undefined): CommandParseResult {
        if (nodes.length === 1) {
            return this.parseOneNode(value, nodes[0], inputArgs, addedNum, cursor)
        } else {
            for (const node of nodes) {
                const result = this.parseOneNode(value, node, inputArgs, addedNum, cursor)

                if (!containError(result.errors)) {
                    return result
                }
            }

            const errors: ParsingProblem[] = [{
                range: { start: 0, end: value.length },
                message: 'Failed to match all nodes.',
                severity: 'error'
            }]

            return addPos({
                argument: {
                    args: [...inputArgs, { type: 'error', value }],
                    cache: {}, errors
                },
                rest: '', cache: {}, errors
            }, addedNum)
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
 * Add specific number of the `ParsingError.range` of the result.
 * @param result The result.
 * @param addedNum The specific number.
 */
function addPos(result: CommandParseResult, addedNum: number): CommandParseResult {
    result.errors = result.errors.map(v => {
        v.range.start += addedNum
        v.range.end += addedNum
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
