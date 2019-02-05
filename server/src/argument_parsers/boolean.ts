import { ArgumentParser, ArgumentParseResult, ParsingProblem } from '../parser'
import { CompletionItem } from 'vscode-languageserver'

export class BooleanParser implements ArgumentParser {
    parse(input: string, cursor: number | undefined): ArgumentParseResult {
        const segments = input.split(/\s/g)
        const problems: ParsingProblem[] = []
        const value = segments[0]
        const rest = segments.slice(1).join(' ')
        let completions: CompletionItem[] | undefined

        // Parsing
        if (value !== '' && ['true', 'false'].indexOf(value.toLowerCase()) === -1) {
            problems.push({
                message: `Expected a boolean value but got: '${value}'.`,
                range: { start: 0, end: value.length },
                severity: 'error'
            })
        } else if (value !== '' && ['true', 'false'].indexOf(value) === -1) {
            problems.push({
                message: `Expected '${value.toLowerCase()}' (lower-cased) but got: '${value}'.`,
                range: { start: 0, end: value.length },
                severity: 'warning'
            })
        }

        // Completions
        if (cursor === 0) {
            completions = [{ label: 'true' }, { label: 'false' }]
        }

        const ans: ArgumentParseResult = {
            argument: { value, type: 'boolean' },
            errors: problems, rest, cache: {}
        }

        if (completions) {
            ans.completions = completions
        }

        return ans
    }
}
