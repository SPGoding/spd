import * as assert from 'power-assert'
import { describe, it } from 'mocha'
import { LiteralParser } from '../../argument_parsers/literal'

describe('LiteralParser Tests', () => {
    describe('parse() tests', () => {
        it('Should parse when a single string is expected', () => {
            const parser = new LiteralParser()

            const result = parser.parse('foo bar', undefined, { expected: ['foo'] })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'literal', value: 'foo'
                },
                rest: 'bar', cache: {}, errors: []
            })
        })
        it('Should parse when multiple strings are expected', () => {
            const parser = new LiteralParser()

            const result1 = parser.parse('foo baz', undefined, { expected: ['foo', 'bar'] })
            const result2 = parser.parse('bar baz', undefined, { expected: ['foo', 'bar'] })

            assert.deepStrictEqual(result1, {
                argument: {
                    type: 'literal', value: 'foo'
                },
                rest: 'baz', cache: {}, errors: []
            })
            assert.deepStrictEqual(result2, {
                argument: {
                    type: 'literal', value: 'bar'
                },
                rest: 'baz', cache: {}, errors: []
            })
        })
        it("Should return error when actual string isn't expected", () => {
            const parser = new LiteralParser()

            const result = parser.parse('foo bar', undefined, { expected: ['baz', 'qux'] })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'literal', value: 'foo'
                },
                errors: [{
                    severity: 'error',
                    range: { start: 0, end: 3 },
                    message: "Expected 'baz' or 'qux' but got: 'foo'."
                }],
                rest: 'bar', cache: {}
            })
        })
        it("Should return warning when actual string isn't expected case", () => {
            const parser = new LiteralParser()

            const result = parser.parse('logadmin bar', undefined, { expected: ['logAdmin'] })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'literal', value: 'logadmin'
                },
                errors: [{
                    severity: 'warning',
                    range: { start: 0, end: 8 },
                    message: "Expected 'logAdmin' (case-sensitive) but got: 'logadmin'."
                }],
                rest: 'bar', cache: {}
            })
        })
        it('Should return completions', () => {
            const parser = new LiteralParser()

            const result = parser.parse('', 0, { expected: ['foo', 'bar'] })

            assert.deepStrictEqual(result, {
                argument: { type: 'literal', value: '' },
                completions: [{ label: 'bar' }, { label: 'foo' }],
                errors: [{
                    message: "Expected 'bar' or 'foo' but got: ''.",
                    range: { start: 0, end: 0 },
                    severity: 'warning'
                }], rest: '', cache: {}
            })
        })
    })
})
