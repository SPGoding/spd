import * as assert from 'power-assert'
import { describe, it } from 'mocha'
import { StringReader } from '../../utils/string_reader'

describe('StringReader() tests', () => {
    describe('read() tests', () => {
        it('Should read single segment', () => {
            const reader = new StringReader('foo')

            const actual = reader.read()

            assert(actual === 'foo')
        })
        it('Should read when step is 2', () => {
            const reader = new StringReader('foo bar baz')

            const actual = reader.read(2)

            assert(actual === 'foo bar')
        })
        it('Should read when step is out of index', () => {
            const reader = new StringReader('foo bar')

            const actual = reader.read(3)

            assert(actual === 'foo bar')
        })
    })
})
