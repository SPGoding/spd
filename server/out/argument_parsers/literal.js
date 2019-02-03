"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils/utils");
class LiteralParser {
    parse(input, params) {
        const segments = input.split(/\s/g);
        const value = segments[0];
        const rest = segments.slice(1).join(' ');
        const errors = [];
        if (params.expected.indexOf(value) === -1) {
            errors.push({
                range: {
                    start: 0,
                    end: value.length
                },
                message: `Expected ${utils_1.convertArrayToString(params.expected)} but got '${value}'.`,
                severity: 'wtf'
            });
        }
        return {
            argument: {
                value: value,
                type: 'literal'
            },
            rest,
            cache: {},
            errors: errors
        };
    }
}
exports.LiteralParser = LiteralParser;
//# sourceMappingURL=literal.js.map