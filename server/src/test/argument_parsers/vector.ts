import * as assert from 'power-assert'
import { describe, it } from 'mocha'
import { VectorParser } from '../../argument_parsers/vector'

describe('VectorParser Tests', () => {
    describe('parse() tests', () => {
        it('Should parse a vec3', () => {
            const parser = new VectorParser()

            const result = parser.parse('1 2 3 foo', undefined, { dimension: 3 })

            assert.deepStrictEqual(result, {
                argument: {
                    type: 'vector', value: '1 2 3'
                },
                rest: 'foo', cache: {}, errors: []
            })
        })
    })
})
