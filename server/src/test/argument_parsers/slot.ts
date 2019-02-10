import * as assert from 'power-assert'
import { describe, it } from 'mocha'
import { SlotParser } from '../../argument_parsers/slot'

describe('SlotParser Tests', () => {
    describe('parse() tests', () => {
        it('Should parse a slot', () => {
            const parser = new SlotParser()

            const result = parser.parse('container.0 foo', undefined, {})

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'slot', value: 'container.0'
                },
                rest: 'foo', cache: {}, errors: []
            })
        })
        it('Should return warning when parsing an invalid first part', () => {
            const parser = new SlotParser()

            const result = parser.parse('foo.0', undefined, {})

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'slot', value: 'foo.0'
                },
                rest: '', cache: {}, errors: [{
                    message: "Expected 'armor', 'container', 'enderchest', 'horse', 'hotbar', 'inventory', 'villager' or 'weapon' but got: 'foo'.",
                    range: { start: 0, end: 3 },
                    severity: 'warning'
                }]
            })
        })
        it('Should return warning when parsing an invalid second part', () => {
            const parser = new SlotParser()

            const result = parser.parse('armor.foo', undefined, {})

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'slot', value: 'armor.foo'
                },
                rest: '', cache: {}, errors: [{
                    message: "Expected 'chest', 'feet', 'head' or 'legs' but got: 'foo'.",
                    range: { start: 6, end: 9 },
                    severity: 'warning'
                }]
            })
        })
        it('Should return completions of first part.', () => {
            const parser = new SlotParser()

            const result = parser.parse('', 0, {})

            assert.deepStrictEqual(result, {
                argument: { type: 'slot', value: '' },
                rest: '', cache: {}, errors: [{
                    message: "Expected 'armor', 'container', 'enderchest', 'horse', 'hotbar', 'inventory', 'villager' or 'weapon' but got: ''.",
                    range: { start: 0, end: 0 },
                    severity: 'warning'
                }], completions: [
                    { label: 'armor' },
                    { label: 'container' },
                    { label: 'enderchest' },
                    { label: 'horse' },
                    { label: 'hotbar' },
                    { label: 'inventory' },
                    { label: 'villager' },
                    { label: 'weapon' }
                ]
            })
        })
        it('Should return completions of second part.', () => {
            const parser = new SlotParser()

            const result = parser.parse('armor.', 6, {})

            assert.deepStrictEqual(result, {
                argument: { type: 'slot', value: 'armor.' },
                rest: '', cache: {}, errors: [{
                    message: "Expected 'chest', 'feet', 'head' or 'legs' but got: ''.",
                    range: { start: 6, end: 6 },
                    severity: 'warning'
                }], completions: [
                    { label: 'chest' },
                    { label: 'feet' },
                    { label: 'head' },
                    { label: 'legs' }
                ]
            })
        })
    })
})
