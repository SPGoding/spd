import { NbtParser } from '../../argument_parsers/nbt_value'
import * as assert from 'power-assert'
import { describe, it } from 'mocha'

const TEST_NBT_COMPOUND = '{CustomNameVisible:1b,Invulnerable:1b,Age:1s,spg:{test:fork},UUID:abcd-blahblahblahblah,double:0.0,float:0.0F,long:10000L}'
const TEST_NUMBER_NBT_LIST = '[0.0d, 1.0d, 2.0d]'
const TEST_STRING_NBT_LIST = '[a,b,c,d,e]'
const TEST_LIST_NBT_LIST = '[[1,2,3],[4,5,6]]'
const TEST_COMPOUND_NBT_LIST = '[{name:sf,age:unknown},{name:spg,age:-1}]'
const TEST_QUOTED_STRING = '{string:"I am a {} {} fucking string","\\"\\\\\"":fuck}'

describe.only('NbtParser tests', () => {
    describe('parseCompound() tests', () => {
        it('Should return a well-parsed NBT compound', () => {
            const parser = new NbtParser()
            assert.deepStrictEqual(parser.parseCompound(TEST_NBT_COMPOUND, 0)[0],
                {
                    CustomNameVisible: { type: 'byte', value: 1 },
                    Invulnerable: { type: 'byte', value: 1 },
                    Age: { type: 'short', value: 1 },
                    spg: {
                        test: 'fork'
                    },
                    UUID: 'abcd-blahblahblahblah',
                    double: { type: 'double', value: 0.0 },
                    float: { type: 'float', value: 0.0 },
                    long: { type: 'long', value: 10000 }
                })
        })
        it('Should correctly parse quoted value', () => {
            const parser = new NbtParser()
            assert.deepStrictEqual(parser.parseCompound(TEST_QUOTED_STRING, 0)[0], {
                string: 'I am a {} {} fucking string',
                '"\\"': 'fuck'
            })
        })
    })
    describe('parseListOrArray() tests', () => {
        it('Should return a well-parsed number NBT list', () => {
            const parser = new NbtParser()
            assert.deepStrictEqual(parser.parseListOrArray(TEST_NUMBER_NBT_LIST, 0)[0], {
                0: {
                    type: 'double',
                    value: 0
                },
                1: {
                    type: 'double',
                    value: 1
                },
                2: {
                    type: 'double',
                    value: 2
                },
                type: 'double'
            })
        })
        it('Should return a well-parsed string NBT list', () => {
            const parser = new NbtParser()
            assert.deepStrictEqual(parser.parseListOrArray(TEST_STRING_NBT_LIST, 0)[0], {
                0: 'a',
                1: 'b',
                2: 'c',
                3: 'd',
                4: 'e',
                type: 'string'
            })
        })
        it('Should return a well-parsed list NBT list', () => {
            const parser = new NbtParser()
            assert.deepStrictEqual(parser.parseListOrArray(TEST_LIST_NBT_LIST, 0)[0], {
                0: {
                    0: {
                        type: 'int',
                        value: 1
                    },
                    1: {
                        type: 'int',
                        value: 2
                    },
                    2: {
                        type: 'int',
                        value: 3
                    },
                    type: 'int'
                },
                1: {
                    0: {
                        type: 'int',
                        value: 4
                    },
                    1: {
                        type: 'int',
                        value: 5
                    },
                    2: {
                        type: 'int',
                        value: 6
                    },
                    type: 'int'
                },
                type: 'list'
            })
        })
        it('Should return a well-parsed compound NBT list', () => {
            const parser = new NbtParser()
            assert.deepStrictEqual(parser.parseListOrArray(TEST_COMPOUND_NBT_LIST, 0)[0], {
                0: {
                    name: 'sf',
                    age: 'unknown'
                },
                1: {
                    name: 'spg',
                    age: {
                        type: 'int',
                        value: -1
                    }
                },
                type: 'compound'
            })
        })
    })
})
