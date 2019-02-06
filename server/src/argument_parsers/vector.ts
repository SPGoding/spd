import { ArgumentParser, ArgumentParseResult, ParsingProblem } from '../parser'

interface VectorParserParams {
    dimension: number
}

export class VectorParser implements ArgumentParser {
    parse(input: string, _cursor: number | undefined, params: VectorParserParams): ArgumentParseResult {
        const segments = input.split(/\s/g)
        const problems: ParsingProblem[] = []
        const value = segments.slice(0, params.dimension).join(' ')
        const rest = segments.slice(params.dimension).join(' ')
        const regex = /^~?[+-]?\d*\.?\d*$/

        if (regex.test(segments[0])) {
            for (let i = 1; i < params.dimension; i++) {
                if (!regex.test(segments[i])) {
                    problems.push({
                        message: `Expected a vector${params.dimension} but got: '${value}'.`,
                        range: { start: 0, end: value.length },
                        severity: 'warning'
                    })
                }
            }
        } else {
            problems.push({
                message: `Expected a vector${params.dimension} but got: '${value}'.`,
                range: { start: 0, end: value.length },
                severity: 'error'
            })
        }

        return {
            argument: {
                value, type: 'vector'
            },
            errors: problems, rest, cache: {}
        }
    }
}
