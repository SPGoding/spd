import { ArgumentParser, ArgumentParseResult, ParsingProblem } from '../parser'
import { CompletionItem } from 'vscode-languageserver'

interface VectorParserParams {
    dimension: number
}
['~', '~', '']
export class VectorParser implements ArgumentParser {
    private readonly ELEMENT_REGEX = /^[~\^]?[+-]?\d*\.?\d*$/

    parse(input: string, cursor: number | undefined, params: VectorParserParams): ArgumentParseResult {
        const segments = input.split(/\s/g)
        const problems: ParsingProblem[] = []
        const value = segments.slice(0, params.dimension).join(' ')
        const rest = segments.slice(params.dimension).join(' ')
        let completions: CompletionItem[] | undefined

        let index = 0

        if (this.ELEMENT_REGEX.test(segments[0])) {
            if (cursor === 0) {
                completions = [{ label: '~' }]
            }
            for (let i = 1; i < params.dimension; i++) {
                // Completion.
                index += segments[i - 1].length + 1
                if (cursor === index) {
                    completions = [{ label: '~' }]
                }

                // Parsing.
                if (segments[i] === '' || !this.ELEMENT_REGEX.test(segments[i])) {
                    problems.push({
                        message: `Expected a vector${params.dimension} but got: '${value}'.`,
                        range: { start: 0, end: value.length },
                        severity: 'warning'
                    })
                    break
                }
            }
        } else {
            problems.push({
                message: `Expected a vector${params.dimension} but got: '${value}'.`,
                range: { start: 0, end: value.length },
                severity: 'error'
            })
        }

        const ans: ArgumentParseResult = {
            result: {
                value, type: 'vector'
            },
            problems: problems, rest, cache: {}
        }

        if (completions) {
            ans.completions = completions
        }

        return ans
    }
}
