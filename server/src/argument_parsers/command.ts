import { ArgumentParser, Command, ArgumentParseResult, Argument, containWtfError, downgradeWtfErrors } from '../parser'
import { commandTree } from '../server'
import { ArgumentType, CommandTreeNode } from '../utils/types'
import { combineLocalCaches } from '../utils/utils'

/**
 * Parses a command.
 * Accepts comments (begin with `#`) and empty lines.
 */
export class CommandParser implements ArgumentParser {
    public parse(value: string) {
        const args: Argument[] = []
        const cmd: Command = { args, cache: {}, errors: [] }
        const ans: ArgumentParseResult = {
            argument: cmd, rest: '', cache: {}, errors: []
        }

        if (value[0] === '#') {
            // TODO: #define support here.
            args.push({ type: 'comment', value: value } as Argument)
        } else if (/^\s*$/.test(value)) {
            args.push({ type: 'empty_line', value: value } as Argument)
        } else {
            this.parseNodes(value, commandTree)
        }

        return ans
    }

    private getArgumentParser(parser: ArgumentType): ArgumentParser {
        switch (parser) {
            case 'command':
                return new CommandParser()
            // TODO: Add more parsers here.
            default:
                throw `Unknown parser "${parser}"`
        }
    }

    public parseOneNode(value: string, node: CommandTreeNode) {
        const parser = this.getArgumentParser(node.parser)
        const ans = parser.parse(value)

        if (!containWtfError(ans.errors)) {
            const result = this.parseNodes(ans.rest, node.children)
            combineLocalCaches(ans.cache, result.cache)
            downgradeWtfErrors(result.errors)
            ans.errors.push(...result.errors)
        }

        return ans
    }

    public parseNodes(value: string, nodes: CommandTreeNode[]): ArgumentParseResult {
        if (nodes.length === 1) {
            return this.parseOneNode(value, nodes[0])
        } else {
            for (const node of nodes) {
                const result = this.parseOneNode(value, node)
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
