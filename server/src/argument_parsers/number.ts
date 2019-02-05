import { ArgumentParser, ArgumentParseResult, ParsingProblem } from '../parser'

interface NumberParserParams {
    isInteger?: boolean,
    min?: number,
    max?: number
}

export class VectorParser implements ArgumentParser {
    parse(input: string, _cursor: number | undefined, params: NumberParserParams): ArgumentParseResult {
        const segments = input.split(/\s/g)
        const errors: ParsingProblem[] = []
        const value = segments[0]
        const rest = segments.slice(1).join(' ')

        if (/^[+-]?\d*\.?\d*$/.test(value)) {
            const num = parseFloat(value)
            if (params.isInteger) {
                if (value.indexOf('.') !== -1) {
                    errors.push({
                        message: `Expected an integer but got: '${value}'.`,
                        range: { start: 0, end: value.length },
                        severity: 'warning'
                    })
                }
            }
            if (params.min !== undefined && num < params.min) {
                errors.push({
                    message: `Expected a number which is larger than ${params.min} but got: '${value}'.`,
                    range: { start: 0, end: value.length },
                    severity: 'warning'
                })
            }
            if (params.max !== undefined && num > params.max) {
                errors.push({
                    message: `Expected a number which is smaller than ${params.max} but got: '${value}'.`,
                    range: { start: 0, end: value.length },
                    severity: 'warning'
                })
            }
        } else {
            errors.push({
                message: `Expected a number but got: '${value}'.`,
                range: { start: 0, end: value.length },
                severity: 'error'
            })
        }

        return {
            argument: {
                value, type: 'number'
            },
            errors, rest, cache: {}
        }
    }
}