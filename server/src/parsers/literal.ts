import { Parser, ParsedResult, ParsingProblem } from '../utils/parser'
import { convertArrayToString } from '../utils/utils'
import { CompletionItem } from 'vscode-languageserver'

interface LiteralParserParams {
    expected: string[]
}

export class LiteralParser implements Parser {
    constructor(private readonly params?: LiteralParserParams) { }

    pull(input: string, cursor: number | undefined, params: LiteralParserParams): ParsedResult {
        const segments = input.split(/\s/g)
        const value = segments[0]
        const rest = segments.slice(1).join(' ')
        const problems: ParsingProblem[] = []
        let completions: CompletionItem[] | undefined

        if (this.params) {
            params = this.params
        }

        if (params.expected.map(e => e.toLowerCase()).indexOf(value.toLowerCase()) === -1) {
            problems.push({
                message: `Expected ${convertArrayToString(params.expected)} but got: '${value}'.`,
                range: { start: 0, end: value.length },
                severity: 'error'
            })
        } else if (params.expected.indexOf(value) === -1) {
            const index = params.expected.map(e => e.toLowerCase()).indexOf(value.toLowerCase())
            problems.push({
                message: `Expected '${params.expected[index]}' (case-sensitive) but got: '${value}'.`,
                range: { start: 0, end: value.length },
                severity: 'warning'
            })
        }

        if (cursor !== 0) {
            completions = undefined
        } else {
            completions = []
            for (const expected of params.expected) {
                completions.push(CompletionItem.create(expected))
            }
        }

        const ans: ParsedResult = {
            result: {
                raw: value,
                type: 'literal'
            },
            problems: problems,
            rest,
            cache: {}
        }
        if (completions) {
            ans.completions = completions
        }

        return ans
    }
}
