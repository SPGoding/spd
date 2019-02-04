import { ArgumentParser, ArgumentParseResult, ParsingProblem } from '../parser'
import { convertArrayToString } from '../utils/utils'
import { CompletionItem } from 'vscode-languageserver'

interface LiteralParserParams {
    expected: string[]
}

export class LiteralParser implements ArgumentParser {
    parse(input: string, cursor: number | undefined, params: LiteralParserParams): ArgumentParseResult {
        const segments = input.split(/\s/g)
        const value = segments[0]
        const rest = segments.slice(1).join(' ')
        const errors: ParsingProblem[] = []
        let completions: CompletionItem[] | undefined

        if (params.expected.indexOf(value) === -1) {
            errors.push({
                range: {
                    start: 0,
                    end: value.length
                },
                message: `Expected ${convertArrayToString(params.expected)} but got '${value}'.`,
                severity: 'error'
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

        return {
            argument: {
                value: value,
                type: 'literal'
            },
            completions,
            errors: errors,
            rest,
            cache: {}
        }
    }
}
