import * as assert from 'power-assert'
import { describe, it } from 'mocha'
import { NumberParser } from '../../argument_parsers/number'

describe('NumberParser Tests', () => {
    describe('parse() tests', () => {
        it('Should parse a number', () => {
            const parser = new NumberParser()

            const result = parser.parse('233.3 foo', undefined, {})

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'number', value: '233.3'
                },
                rest: 'foo', cache: {}, errors: []
            })
        })
        it('Should parse an integer', () => {
            const parser = new NumberParser()

            const result = parser.parse('233 foo', undefined, { isInteger: true })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'number', value: '233'
                },
                rest: 'foo', cache: {}, errors: []
            })
        })
        it('Should return error when parsing non-numbers', () => {
            const parser = new NumberParser()

            const result = parser.parse('foo bar', undefined, {})

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'number', value: 'foo'
                },
                rest: 'bar', cache: {}, errors: [{
                    message: "Expected a number but got: 'foo'.",
                    range: { start: 0, end: 3 },
                    severity: 'error'
                }]
            })
        })
        it('Should return warning when parsing non-integers', () => {
            const parser = new NumberParser()

            const result = parser.parse('2.0 foo', undefined, { isInteger: true })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'number', value: '2.0'
                },
                rest: 'foo', cache: {}, errors: [{
                    message: "Expected an integer but got: '2.0'.",
                    range: { start: 0, end: 3 },
                    severity: 'warning'
                }]
            })
        })
        it('Should return warning when parsing numbers smaller than min', () => {
            const parser = new NumberParser()

            const result = parser.parse('-1 foo', undefined, { min: 0 })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'number', value: '-1'
                },
                rest: 'foo', cache: {}, errors: [{
                    message: "Expected a number which is larger than 0 but got: '-1'.",
                    range: { start: 0, end: 2 },
                    severity: 'warning'
                }]
            })
        })
        it('Should return warning when parsing numbers larger than max', () => {
            const parser = new NumberParser()

            const result = parser.parse('128 foo', undefined, { max: 127 })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'number', value: '128'
                },
                rest: 'foo', cache: {}, errors: [{
                    message: "Expected a number which is smaller than 127 but got: '128'.",
                    range: { start: 0, end: 3 },
                    severity: 'warning'
                }]
            })
        })
    })
})
