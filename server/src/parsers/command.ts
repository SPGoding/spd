import * as fs from 'fs'
import * as path from 'path'
import { Parser, Argument, ParsedResult, ParsingProblem } from '../utils/parser'
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
 * Provides methods to parse a command.
 * Accepts comments (begin with `#`) and empty lines.
 */
export class CommandParser extends Parser {
    public static id = 'command'

    public parse(input: string, index: number): ParsedResult {


        throw new Error('Method not implemented.')
    }

    public parseViaNodes(input: string, index: number, nodes: CommandTreeNode[]) {
        if (nodes.length === 1) {

        } else {
            for (const node of nodes) {
                const result = this.parseViaOneNode(input, index, node)
            }
        }
    }

    public parseViaOneNode(input: string, index: number, node: CommandTreeNode): ParsedResult {
        if (node.parser) {
            // parser
            const result = this.getParser(node.parser, node.params).parse(input, index)
            if (result.endIndex >= input.length - 1 && !node.executable) {
                if (!result.problems) {
                    result.problems = []
                }
                result.problems.push({
                    message: 'Expected executable command but got: EOF.',
                    range: { start: input.length - 1, end: input.length },
                    severity: 'warning'
                })
            }
            if (result.endIndex < input.length - 1 && !node.children) {
                if (!result.problems) {
                    result.problems = []
                }
                result.problems.push({
                    message: `Expected EOF but got: '${input.slice(result.endIndex + 1)}'.`,
                    range: { start: result.endIndex + 1, end: input.length },
                    severity: 'warning'
                })
            }
            // TODO: recursive

        } else if (node.template) {
            // template
        } else {
            throw new Error('Expected a parser or template.')
        }
    }

    private getParser(id: string, params?: object): Parser {
        // TODO: Add new parsers here.
        const parserList = [CommandParser]

        for (const parser of parserList) {
            if (parser.id === id) {
                return new parser(params)
            }
        }

        throw new Error(`Unexpected parser id: '${id}'.`)
    }
}

/**
 * Whether the input parsing problems contain severity 'error'.
 * @param problems The parsing problems.
 */
function containError(problems: ParsingProblem[]) {
    for (const error of problems) {
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
 * If the origin is an array, this function will be called to all items of the array.
 * Otherwise `override.children` and `override.executable` will be set to the deepest child node of `origin`, 
 * and `override.description` will be set to `origin` directly.
 * @param origin The origin node or array of nodes. WILL be overriden.
 * @param override The override node.
 */
export function combineCommandTreeNodes(origin: Template, override: CommandTreeNode) {
    if (origin instanceof Array) {
        origin.forEach(node => {
            combineCommandTreeNodes(node, override)
        })
    } else {
        const recursion = (node: CommandTreeNode) => {
            if (node.children) {
                node.children.forEach(v => {
                    recursion(v)
                })
            } else {
                node.children = override.children
                node.executable = override.executable
            }
        }
        recursion(origin)

        if (override.description) {
            origin.description = override.description
        }
    }
}

interface CommandParseResult extends ParsedResult {
    argument: Command
    rest: string
    cache: LocalCache
    problems: ParsingProblem[]
    completions?: CompletionItem[]
}
