import * as assert from 'power-assert'
import { describe, it } from 'mocha'
import { LiteralParser } from '../../argument_parsers/literal'

describe('LiteralParser Tests', () => {
    describe('parse() tests', () => {
        it('Should parse when a single string is expected', () => {
            const parser = new LiteralParser()

            const result = parser.parse('foo bar', { expected: ['foo'] })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'literal', value: 'foo'
                },
                rest: 'bar', cache: {}, errors: []
            })
        })
        it('Should parse when multiple strings are expected', () => {
            const parser = new LiteralParser()

            const result1 = parser.parse('foo baz', { expected: ['foo', 'bar'] })
            const result2 = parser.parse('bar baz', { expected: ['foo', 'bar'] })

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
        it("Should return errors when actual string isn't expected", () => {
            const parser = new LiteralParser()

            const result = parser.parse('foo bar', { expected: ['baz', 'qux'] })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'literal', value: 'foo'
                },
                errors: [{
                    severity: 'error',
                    range: { start: 0, end: 3 },
                    message: "Expected 'baz' or 'qux' but got 'foo'."
                }],
                rest: 'bar', cache: {}
            })
        })
    })
})