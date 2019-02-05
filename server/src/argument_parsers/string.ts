import { ArgumentParser, ArgumentParseResult, ParsingProblem } from '../parser'

interface StringParserParams {
    type: 'word' | 'phrase' | 'greedy'
}

export class StringParser implements ArgumentParser {
    parse(input: string, _cursor: number | undefined, params: StringParserParams): ArgumentParseResult {
        const segments = input.split(/\s/g)
        const errors: ParsingProblem[] = []
        let value = input
        let rest = ''

        switch (params.type) {
            case 'word':
                value = segments[0]
                rest = segments.slice(1).join(' ')
                break
            case 'phrase':
                if (input[0] !== '"') {
                    value = segments[0]
                    rest = segments.slice(1).join(' ')
                } else {
                    let escaped = false
                    let hasEnded = false
                    for (let index = 1; index < input.length; index++) {
                        const char = input[index]
                        if (char === '\\') {
                            escaped = !escaped
                        } else if (char === '"') {
                            if (escaped) {
                                escaped = false
                            } else {
                                if (input[index + 1] === undefined ||
                                    input[index + 1] === ' ') {
                                    value = input.slice(0, index + 1)
                                    rest = input.slice(index + 2)
                                    hasEnded = true
                                    break
                                } else {
                                    errors.push({
                                        message: 'Found traling data after quote.',
                                        range: { start: index + 1, end: input.length },
                                        severity: 'warning'
                                    })
                                    hasEnded = true
                                    break
                                }
                            }
                        }
                    }
                    if (!hasEnded) {
                        errors.push({
                            message: `Expected an ending quote '"'.`,
                            range: { start: 0, end: input.length },
                            severity: 'warning'
                        })
                    }
                }
                break
            case 'greedy':
            default:
                break
        }

        return {
            argument: {
                value, type: 'string'
            },
            errors, rest, cache: {}
        }
    }
}
