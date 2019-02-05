import * as assert from 'power-assert'
import { describe, it } from 'mocha'
import { StringParser } from '../../argument_parsers/string'

describe('StringParser Tests', () => {
    describe('parse() tests', () => {
        it('Should parse word string', () => {
            const parser = new StringParser()

            const result = parser.parse('foo bar', undefined, { type: 'word' })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'string', value: 'foo'
                },
                rest: 'bar', cache: {}, errors: []
            })
        })
        it('Should parse simple phrase string', () => {
            const parser = new StringParser()

            const result = parser.parse('foo bar', undefined, { type: 'phrase' })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'string', value: 'foo'
                },
                rest: 'bar', cache: {}, errors: []
            })
        })
        it('Should parse complex phrase string', () => {
            const parser = new StringParser()

            const result = parser.parse('"foo bar" baz', undefined, { type: 'phrase' })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'string', value: '"foo bar"'
                },
                rest: 'baz', cache: {}, errors: []
            })
        })
        it('Should parse complex phrase string with escape', () => {
            const parser = new StringParser()

            const result = parser.parse('"foo \\"bar" baz', undefined, { type: 'phrase' })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'string', value: '"foo \\"bar"'
                },
                rest: 'baz', cache: {}, errors: []
            })
        })
        it('Should return warning when missing ending quote', () => {
            const parser = new StringParser()

            const result = parser.parse('"foo bar', undefined, { type: 'phrase' })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'string', value: '"foo bar'
                }, errors: [{
                    severity: 'warning',
                    range: { start: 0, end: 8 },
                    message: `Expected an ending quote '"'.`
                }], rest: '', cache: {},
            })
        })
        it('Should return warning when having trailing data after quote', () => {
            const parser = new StringParser()

            const result = parser.parse('"foo"bar', undefined, { type: 'phrase' })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'string', value: '"foo"bar'
                }, errors: [{
                    severity: 'warning',
                    range: { start: 5, end: 8 },
                    message: 'Found traling data after quote.'
                }], rest: '', cache: {},
            })
        })
        it('Should parse greedy string', () => {
            const parser = new StringParser()

            const result = parser.parse('foo bar', undefined, { type: 'greedy' })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'string', value: 'foo bar'
                },
                rest: '', cache: {}, errors: []
            })
        })
    })
})
