import { ArgumentParser, ArgumentParseResult, ParsingProblem } from '../parser'
import { CompletionItem } from 'vscode-languageserver'
import { convertArrayToString } from '../utils/utils'

export class SlotParser implements ArgumentParser {
    private readonly COMPLETION_TREE: [string, string[]][] = [
        ['armor', ['chest', 'feet', 'head', 'legs']],
        ['container', [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
            '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
            '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
            '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
            '41', '42', '43', '44', '45', '46', '47', '48', '49', '50',
            '51', '52', '53'
        ]],
        ['enderchest', ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
            '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
            '21', '22', '23', '24', '25', '26']],
        ['horse', [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
            '11', '12', '13', '14', 'armor', 'chest', 'saddle'
        ]],
        ['hotbar', ['0', '1', '2', '3', '4', '5', '6', '7', '8']],
        ['inventory', ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
            '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
            '21', '22', '23', '24', '25', '26']],
        ['villager', ['0', '1', '2', '3', '4', '5', '6', '7']],
        ['weapon', ['mainhand', 'offhand']]
    ]

    parse(input: string, cursor: number | undefined, params: object): ArgumentParseResult {
        const segments = input.split(/\s/g)
        const problems: ParsingProblem[] = []
        const value = segments[0]
        const rest = segments.slice(1).join(' ')
        let completions: CompletionItem[] | undefined

        const parts = value.split(/\./g)

        if (parts[0] === '' && cursor === 0) {
            // Completion for first part.
            completions = this.COMPLETION_TREE.map(v => ({ label: v[0] }))
        }

        // Parsing first part.
        if (this.COMPLETION_TREE.map(v => v[0]).indexOf(parts[0]) === -1) {
            problems.push({
                message: `Expected ${convertArrayToString(this.COMPLETION_TREE.map(v => v[0]))} but got: '${parts[0]}'.`,
                range: { start: 0, end: parts[0].length },
                severity: 'warning'
            })
        }

        const secondPartValues = this.COMPLETION_TREE.find(v => v[0] === parts[0])

        if (parts[1] === '' && cursor === parts[0].length + 1) {
            // Completion for second part.
            if (secondPartValues) {
                completions = secondPartValues[1].map(v => ({ label: v }))
            }
        }

        // Parsing second part.
        if (secondPartValues) {
            if (secondPartValues[1].indexOf(parts[1]) === -1) {
                problems.push({
                    message: `Expected ${convertArrayToString(secondPartValues[1])} but got: '${parts[1]}'.`,
                    range: { start: parts[0].length + 1, end: value.length },
                    severity: 'warning'
                })
            }
        }

        const ans: ArgumentParseResult = {
            result: {
                value, type: 'slot'
            },
            problems: problems, rest, cache: {}
        }

        if (completions) {
            ans.completions = completions
        }

        return ans
    }
}
