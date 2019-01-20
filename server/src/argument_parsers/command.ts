import { ArgumentParser, Command, ArgumentParseResult, Argument } from '../parser'
import { commandTree } from '../server'
import { ArgumentType, CommandTreeNode } from '../utils/types'
import { combineLocalCaches } from '../utils/utils'
import { NbtValue } from './nbt_value'
import { Selector } from './selector'

/**
 * Parses a command.
 * Accepts comments (begin with `#`) and empty lines.
 */
export class CommandParser implements ArgumentParser {
    public parse(value: string) {
        const ans: ArgumentParseResult = {
            arguments: [], rest: '', cache: {}, errors: []
        }

        if (value[0] === '#') {
            ans.arguments.push({ type: 'comment', value: value } as Argument)
        } else if (/^\s*$/.test(value)) {
            ans.arguments.push({ type: 'empty_line', value: value } as Argument)
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
        args.push(ans.argument)

        if (!ans.errors || ans.errors.length === 0) {
            const result = this.parseNodes(ans.rest, node.children, args)
            combineLocalCaches(ans.cache, result.cache)
            ans.errors.push(...result.errors)
        }

        return ans
    }

    public parseNodes(value: string, nodes: CommandTreeNode[]): ArgumentParseResult {
        if (nodes.length === 1) {
            return this.parseOneNode(value, nodes[0], args)
        } else {
            const parsers: string[] = []
            for (const node of nodes) {
                parsers.push(node.parser)
                const result = this.parseOneNode(value, node)
                if (!result.errors || result.errors.length === 0) {
                    return result
                }
            }
            return {
                argument: {
                    type: 'error',
                    value: value
                },
                rest: '', cache: {},
                errors: []
            }
        }
    }
}
