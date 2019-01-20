"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../server");
const utils_1 = require("../utils/utils");
class CommandParser {
    parse(value) {
        const cmd = { args: [] };
        const ans = {
            argument: cmd, rest: '', cache: {}, errors: []
        };
        if (value[0] === '#') {
            cmd.args.push({ type: 'comment', value: value });
        }
        else if (/^\s*$/.test(value)) {
            cmd.args.push({ type: 'empty_line', value: value });
        }
        else {
            this.parseNodes(value, server_1.commandTree, cmd.args);
        }
        return ans;
    }
    getArgumentParser(parser) {
        switch (parser) {
            case 'command':
                return new CommandParser();
            default:
                throw `Unknown parser "${parser}"`;
        }
    }
    parseOneNode(value, node) {
        const parser = this.getArgumentParser(node.parser);
        const ans = parser.parse(value);
        const args = [ans.argument];
        if (!ans.errors || ans.errors.length === 0) {
            const result = this.parseNodes(ans.rest, node.children, args);
            utils_1.combineLocalCaches(ans.cache, result.cache);
            ans.errors.push(...result.errors);
        }
        return ans;
    }
    parseNodes(value, nodes, args) {
        if (nodes.length === 1) {
            return this.parseOneNode(value, nodes[0]);
        }
        else {
            const parsers = [];
            for (const node of nodes) {
                parsers.push(node.parser);
                const result = this.parseOneNode(value, node);
                if (!result.errors || result.errors.length === 0) {
                    return result;
                }
            }
            return {
                argument: {
                    type: 'error',
                    value: value
                },
                rest: '', cache: {},
                errors: []
            };
        }
    }
}
exports.CommandParser = CommandParser;
//# sourceMappingURL=command.js.map