"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseFunction(content) {
    const lines = content.split(/\n/g);
    const ans = [];
    for (const line of lines) {
        ans.push(parseCommand(line));
    }
    return ans;
}
exports.parseFunction = parseFunction;
function parseCommand(command) {
    const ans = { args: [], cache: {} };
    return ans;
}
//# sourceMappingURL=parser.js.map