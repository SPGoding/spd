import { ArgumentParser, ArgumentParseResult, ParsingError } from '../parser'
import { convertArrayToString } from '../utils/utils'

export interface LiteralParserParams {
    accepts: string[]
}

export class LiteralParser implements ArgumentParser {
    parse(input: string, params: LiteralParserParams): ArgumentParseResult {
        const segments = input.split(/\s/g)
        const value = segments[0]
        const rest = segments.slice(1).join(' ')
        const errors: ParsingError[] = [];

        if (params.accepts.indexOf(value) === -1) {
            errors.push({
                range: {
                    start: 0,
                    end: value.length
                },
                message: `Expected ${convertArrayToString(params.accepts)} but got '${value}'.`,
                severity: 'wtf'
            })
        }

        return {
            argument: {
                value: value,
                type: 'literal'
            },
            rest,
            cache: {},
            errors: errors
        }
    }
}
