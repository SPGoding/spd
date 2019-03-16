import * as fs from 'fs'
import * as path from 'path'
import { ArgumentParser, Argument, Command, ArgumentParseResult, ParsingProblem } from '../parser'
import { ArgumentType, CommandTreeNode, LocalCache, DefinitionTypes, CommandTree, Template } from '../utils/types'
import { combineLocalCaches, convertArrayToString } from '../utils/utils'
import { LiteralParser } from './literal'
import { CompletionItem } from 'vscode-languageserver'

const commandTree = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../../ref/commands.json'), { encoding: 'utf8' })
) as CommandTree
const templates = commandTree.templates
const commandNodes = commandTree.commands

/**
 * Parses a command.
 * Accepts comments (begin with `#`) and empty lines.
 */
export class CommandParser implements ArgumentParser {
    private readonly completions: CompletionItem[] = []

    public parse(value: string, cursor: number | undefined) {
        const args: Argument[] = []
        const cmd: Command = { args, cache: {}, problems: [] }
        const ans: ArgumentParseResult = {
            result: cmd, rest: '', cache: cmd.cache,
            problems: cmd.problems, completions: this.completions
        }

        if (value[0] === '#') {
            // Completion
            if (value.length === 1 && cursor === 1) {
                this.completions.push(CompletionItem.create('define'))
                this.completions.push(CompletionItem.create('region'))
            }

            // Further suppoer.
            if (value.slice(0, 8) === '#define ') {
                // Completion.
                if (value.length === 8 && cursor === 8) {
                    const cpls = DefinitionTypes.map(v => CompletionItem.create(v))
                    this.completions.push(...cpls)
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
                        ans.problems.push({
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
            const result = this.parseNodes(value, commandNodes, args, 0, cursor)
            ans.result = result.result
            combineLocalCaches(ans.cache, result.cache)
            ans.problems.push(...result.problems)
            ans.completions
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

    public parseOneNode(value: string, node: CommandTreeNode, inputArgs: Argument[],
        addedNum: number, cursor: number | undefined): CommandParseResult {
        if (node.parser !== undefined) {
            const parser = this.getArgumentParser(node.parser)
            const result = parser.parse(value, cursor, node.params)
            combineCompletions(this.completions, result.completions)

            var args = [...inputArgs, result.result]

            if (!containError(result.problems)) {
                if (node.children) {
                    const addedNum = value.length - result.rest.length
                    const subResult = this.parseNodes(result.rest, node.children, args, addedNum,
                        cursor !== undefined ? cursor - addedNum : undefined)
                    combineLocalCaches(result.cache, subResult.cache)
                    downgradeErrors(subResult.problems)
                    result.problems.push(...subResult.problems)
                    args = [...subResult.result.args]
                    result.rest = subResult.rest
                }
            }

            const ans = {
                result: {
                    cache: result.cache,
                    problems: result.problems,
                    args
                }, rest: result.rest, cache: result.cache, problems: result.problems
            }

            return addPosToProblems(ans, addedNum)
        } else if (node.template) {
            const templateName = node.template
            const template = templates[templateName]
            combineCommandTreeNodes(templates, node)
            if (template instanceof Array) {
                return this.parseNodes(value, template, inputArgs, addedNum,
                    cursor !== undefined ? cursor - addedNum : undefined)
            } else {
                return this.parseOneNode(value, template, inputArgs, addedNum,
                    cursor !== undefined ? cursor - addedNum : undefined)
            }
        } else {
            throw "Expected 'parser' or 'template' but got: nothing."
        }
    }

    public parseNodes(value: string, nodes: CommandTreeNode[], inputArgs: Argument[],
        addedNum: number, cursor: number | undefined): CommandParseResult {
        if (nodes.length === 1) {
            return this.parseOneNode(value, nodes[0], inputArgs, addedNum, cursor)
        } else {
            for (const node of nodes) {
                const result = this.parseOneNode(value, node, inputArgs, addedNum, cursor)

                if (!containError(result.problems)) {
                    return result
                }
            }

            const problems: ParsingProblem[] = [{
                range: { start: 0, end: value.length },
                message: 'Failed to match all nodes.',
                severity: 'error'
            }]

            return addPosToProblems({
                result: {
                    args: [...inputArgs, { type: 'error', value }],
                    cache: {}, problems
                },
                rest: '', cache: {}, problems
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
function addPosToProblems(result: CommandParseResult, addedNum: number): CommandParseResult {
    result.problems = result.problems.map(v => {
        v.range.start += addedNum
        v.range.end += addedNum
        return v
    })
    return result
}

/**
 * Combine two completions.
 * @param origin The origin completions. WILL be overriden.
 * @param override The override completions.
 */
export function combineCompletions(origin: CompletionItem[], override: CompletionItem[] | undefined) {
    if (override) {
        origin.push(...override)
    }
}

/**
 * Combine two command tree nodes.
 * If the origin is an array, `override.description` will be set to all items in `origin` and
 * `override.children` & `override.executable` will be set to the last item of `origin`.
 * Otherwise `override.children`, `override.description` and `override.executable` will be set to `origin`.
 * @param origin The origin node or array of nodes. WILL be overriden.
 * @param override The override node.
 */
export function combineCommandTreeNodes(origin: Template, override: CommandTreeNode) {
    if (origin instanceof Array) {
        if (override.description) {
            origin.forEach(node => {
                node.description = override.description
            })
        }
        if (override.children) {
            origin[origin.length - 1].children = override.children
        }
        if (override.executable) {
            origin[origin.length - 1].executable = override.executable
        }
    } else {
        if (override.children) {
            origin.children = override.children
        }
        if (override.description) {
            origin.description = override.description
        }
        if (override.executable) {
            origin.executable = override.executable
        }
    }
}

interface CommandParseResult extends ArgumentParseResult {
    result: Command
    rest: string
    cache: LocalCache
    problems: ParsingProblem[]
    completions?: CompletionItem[]
}
