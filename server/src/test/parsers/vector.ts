import * as assert from 'power-assert'
import { describe, it } from 'mocha'
import { VectorParser } from '../../argument_parsers/vector'

describe('VectorParser Tests', () => {
    describe('parse() tests', () => {
        it('Should parse a vec3', () => {
            const parser = new VectorParser()

            const result = parser.parse('~ 5 ~-.1 foo', undefined, { dimension: 3 })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'vector', value: '~ 5 ~-.1'
                },
                rest: 'foo', cache: {}, errors: []
            })
        })
        it('Should return error when parsing a non-vector', () => {
            const parser = new VectorParser()

            const result = parser.parse('foo ~ ~ bar', undefined, { dimension: 3 })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'vector', value: 'foo ~ ~'
                },
                rest: 'bar', cache: {}, errors: [{
                    message: "Expected a vector3 but got: 'foo ~ ~'.",
                    range: { start: 0, end: 7 },
                    severity: 'error'
                }]
            })
        })
        it('Should return warning when parsing a lower-dimension vector', () => {
            const parser = new VectorParser()

            const result = parser.parse('~ ~', undefined, { dimension: 3 })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'vector', value: '~ ~'
                },
                rest: '', cache: {}, errors: [{
                    message: "Expected a vector3 but got: '~ ~'.",
                    range: { start: 0, end: 3 },
                    severity: 'warning'
                }]
            })
        })
        it('Should return completions for first element', () => {
            const parser = new VectorParser()

            const result = parser.parse('~ ', 2, { dimension: 3 })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'vector', value: '~ '
                },
                rest: '', cache: {}, errors: [{
                    message: "Expected a vector3 but got: '~ '.",
                    range: { start: 0, end: 2 },
                    severity: 'warning'
                }], completions: [
                    { label: '~' }
                ]
            })
        })
        it('Should return completions for futher elements', () => {
            const parser = new VectorParser()

            const result = parser.parse('~ ~ ', 4, { dimension: 3 })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'vector', value: '~ ~ '
                },
                rest: '', cache: {}, errors: [{
                    message: "Expected a vector3 but got: '~ ~ '.",
                    range: { start: 0, end: 4 },
                    severity: 'warning'
                }], completions: [
                    { label: '~' }
                ]
            })
        })
    })
})
