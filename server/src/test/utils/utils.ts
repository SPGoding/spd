import * as assert from 'power-assert'
import { describe, it } from 'mocha'
import { convertArrayToString } from '../../utils/utils'

describe('convertArrayToString() tests', () => {
    it('Should work when the array contains one element', () => {
        const result = convertArrayToString(['foo'])

        assert.deepStrictEqual(result, "'foo'")
    })
    it('Should work when the array contains two elements', () => {
        const result = convertArrayToString(['foo', 'bar'])

        assert.deepStrictEqual(result, "'bar' or 'foo'")
    })
    it('Should work when the array contains three elements', () => {
        const result = convertArrayToString(['foo', 'bar', 'baz'])

        assert.deepStrictEqual(result, "'bar', 'baz' or 'foo'")
    })
})
