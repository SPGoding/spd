import * as assert from 'power-assert'
import { describe, it } from 'mocha'
import { LiteralParser } from '../../argument_parsers/literal'

describe('LiteralParser Tests', () => {
    describe('parse() tests', () => {
        it('Should parse single accept', () => {
            const parser = new LiteralParser()

            const result = parser.parse('foo bar', { accepts: ['foo'] })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'literal', value: 'foo'
                },
                rest: 'bar', cache: {}, errors: []
            })
        })
        it('Should parse multiple accepts', () => {
            const parser = new LiteralParser()

            const result1 = parser.parse('foo baz', { accepts: ['foo', 'bar'] })
            const result2 = parser.parse('bar baz', { accepts: ['foo', 'bar'] })

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
        it('Should return errors when not matching', () => {
            const parser = new LiteralParser()

            const result = parser.parse('foo bar', { accepts: ['baz'] })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'literal', value: 'foo'
                },
                errors: [{
                    severity: 'wtf',
                    range: { start: 0, end: 3 },
                    message: "Expected 'baz' but got 'foo'."
                }],
                rest: 'bar', cache: {}
            })
        })
    })
})
