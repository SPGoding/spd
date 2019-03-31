import { Parser, ParsedResult, ParsingProblem } from '../utils/parser'

interface NumberParserParams {
    isInteger?: boolean,
    min?: number,
    max?: number
}

export class NumberParser implements Parser {
    pull(input: string, _cursor: number | undefined, params: NumberParserParams): ParsedResult {
        const segments = input.split(/\s/g)
        const problems: ParsingProblem[] = []
        const value = segments[0]
        const rest = segments.slice(1).join(' ')

        if (/^[+-]?\d*\.?\d*$/.test(value)) {
            const num = parseFloat(value)
            if (params.isInteger) {
                if (value.indexOf('.') !== -1) {
                    problems.push({
                        message: `Expected an integer but got: '${value}'.`,
                        range: { start: 0, end: value.length },
                        severity: 'warning'
                    })
                }
            }
            if (params.min !== undefined && num < params.min) {
                problems.push({
                    message: `Expected a number which is larger than ${params.min} but got: '${value}'.`,
                    range: { start: 0, end: value.length },
                    severity: 'warning'
                })
            }
            if (params.max !== undefined && num > params.max) {
                problems.push({
                    message: `Expected a number which is smaller than ${params.max} but got: '${value}'.`,
                    range: { start: 0, end: value.length },
                    severity: 'warning'
                })
            }
        } else {
            problems.push({
                message: `Expected a number but got: '${value}'.`,
                range: { start: 0, end: value.length },
                severity: 'error'
            })
        }

        return {
            result: {
                raw: value, type: 'number'
            },
            problems: problems, rest, cache: {}
        }
    }
}
