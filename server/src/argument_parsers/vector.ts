import { ArgumentParser, ArgumentParseResult, ParsingProblem } from '../parser'

interface VectorParserParams {
    dimension: number
}

export class VectorParser implements ArgumentParser {
    parse(input: string, _cursor: number | undefined, params: VectorParserParams): ArgumentParseResult {
        const segments = input.split(/\s/g)
        const errors: ParsingProblem[] = []
        const value = segments[0]
        const rest = segments.slice(1).join(' ')

        

        return {
            argument: {
                value, type: 'vector'
            },
            errors, rest, cache: {}
        }
    }
}
