import * as assert from 'power-assert'
import { describe, it } from 'mocha'
import { BooleanParser } from '../../argument_parsers/boolean'

describe('BooleanParser Tests', () => {
    describe('parse() tests', () => {
        it('Should parse false', () => {
            const parser = new BooleanParser()

            const result = parser.parse('false foo', undefined)

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'boolean', value: 'false'
                },
                rest: 'foo', cache: {}, errors: []
            })
        })
        it('Should parse true', () => {
            const parser = new BooleanParser()

            const result = parser.parse('true foo', undefined)

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'boolean', value: 'true'
                },
                rest: 'foo', cache: {}, errors: []
            })
        })
        it('Should return completions', () => {
            const parser = new BooleanParser()

            const result = parser.parse('', 0)

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'boolean', value: ''
                }, rest: '', cache: {}, errors: [],
                completions: [{ label: 'true' }, { label: 'false' }]
            })
        })
        it('Should return error when parsing non-booleans', () => {
            const parser = new BooleanParser()

            const result = parser.parse('foo bar', undefined)

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'boolean', value: 'foo'
                },
                rest: 'bar', cache: {}, errors: [{
                    message: "Expected a boolean value but got: 'foo'.",
                    range: { start: 0, end: 3 },
                    severity: 'error'
                }]
            })
        })
        it('Should return error when parsing non-lower-cased', () => {
            const parser = new BooleanParser()

            const result = parser.parse('trUE bar', undefined)

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'boolean', value: 'trUE'
                },
                rest: 'bar', cache: {}, errors: [{
                    message: "Expected 'true' (lower-cased) but got: 'trUE'.",
                    range: { start: 0, end: 4 },
                    severity: 'warning'
                }]
            })
        })
    })
})
