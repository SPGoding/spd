"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseFunction(content) {
    const lines = content.split(/\r\n/g);
    const ans = [];
    for (const line of lines) {
        ans.push(parseCommand(line));
    }
    return ans;
}
exports.parseFunction = parseFunction;
function parseCommand(command) {
    const ans = { args: [], cache: {} };
    const segments = [];
    return ans;
}
exports.parseCommand = parseCommand;
//# sourceMappingURL=parser.js.map