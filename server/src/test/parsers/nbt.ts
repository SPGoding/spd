import { NbtParser } from '../../argument_parsers/nbt'
import * as assert from 'power-assert'
import { describe, it } from 'mocha'

const TEST_NBT_COMPOUND = '{CustomNameVisible:1b,Invulnerable:1b,Age:1s,spg:{test:fork},UUID:abcd-blahblahblahblah,double:0.0,float:0.0F,long:10000L}'
const TEST_NUMBER_NBT_LIST = '[0.0d, 1.0d, 2.0d]'
const TEST_STRING_NBT_LIST = '[a,b,c,d,e]'
const TEST_LIST_NBT_LIST = '[[1,2,3],[4,5,6]]'
const TEST_COMPOUND_NBT_LIST = '[{name:sf,age:unknown},{name:spg,age:-1}]'
const TEST_QUOTED_STRING = `{string:"I am a {} {} ducking string","\\"\\\\"":'"du\\'ck"'}`
const TEST_QUOTED_LIST = '["quote","\\"DUCKING\\\\ \\\\QUOTE\\""]'
const TEST_NBT_ARRAY = '[I;1,2,3]'
const TEST_ERROR_COMPOUND = '{wow:notenclosing'
const TEST_ERROR_FAULT_QUOTE_COMPOUND = '{wow:"duck}'
const TEST_ERROR_LIST = '[duck,duck'
const TEST_FAULT_ASSIGNMENT = '[DUCK;duck,duck]'
const TEST_DUPLICATED_ASSIGNMENT = '[I;L;1]'
const TEST_FAULT_QUOTE_LIST = '[duck,"duck]'
const TEST_FAULT_TYPE_ARRAY = '[I;duck]'
const TEST_FAULT_TYPE_LIST = '[1.0,1]'
const TEST_INT_OUT_OF_RANGE_LIST = '[2147483648]'

describe('NbtParser tests', () => {
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
                string: 'I am a {} {} ducking string',
                '"\\"': `"du'ck"`
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
        it('Should correctly parse quoted string', () => {
            const parser = new NbtParser()
            assert.deepStrictEqual(parser.parseListOrArray(TEST_QUOTED_LIST, 0)[0], {
                0: 'quote',
                1: '"DUCKING\\ \\QUOTE"',
                type: 'string'
            })
        })
        it('Should correctly parse nbt array', () => {
            const parser = new NbtParser()
            assert.deepStrictEqual(parser.parseListOrArray(TEST_NBT_ARRAY, 0)[0], {
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
            })
        })
        it('Should be string-typed', () => {
            const parser = new NbtParser()
            assert.deepStrictEqual(parser.parseListOrArray(TEST_INT_OUT_OF_RANGE_LIST, 0)[0], {
                0: '2147483648',
                type: 'string'
            })
        })
    })
    describe('Parsing error test', () => {
        describe('Compound error', () => {
            it('Should produce compound not enclosing error', () => {
                const parser = new NbtParser()
                parser.parseCompound(TEST_ERROR_COMPOUND, 0)
                assert.deepStrictEqual(parser.parsingProblems, [
                    {
                        range: {
                            start: 0,
                            end: 17
                        },
                        message: 'Compound not enclosing!',
                        severity: 'warning'
                    }
                ])
            })
            it('Should produce quotation mark not enclosing error', () => {
                const parser = new NbtParser()
                parser.parseCompound(TEST_ERROR_FAULT_QUOTE_COMPOUND, 0)
                assert.deepStrictEqual(parser.parsingProblems, [
                    {
                        range: {
                            start: 5,
                            end: 11
                        },
                        message: 'String not enclosing!',
                        severity: 'warning'
                    }
                ])
            })
        })
        describe('List or Array error', () => {
            it('Should produce list not enclosing error', () => {
                const parser = new NbtParser()
                parser.parseListOrArray(TEST_ERROR_LIST,0)
                assert.deepStrictEqual(parser.parsingProblems, [
                    {
                        range: {
                            start: 0,
                            end: 10
                        },
                        message: 'List not enclosing!',
                        severity: 'warning'
                    }
                ])
            })
            it('Should produce quotation mark not enclosing error', () => {
                const parser = new NbtParser()
                parser.parseListOrArray(TEST_FAULT_QUOTE_LIST,0)
                assert.deepStrictEqual(parser.parsingProblems, [
                    {
                        range: {
                            start: 6,
                            end: 12
                        },
                        message: 'String not enclosing!',
                        severity: 'warning'
                    }
                ])
            })
            it('Should produce fault type assignment error', () => {
                const parser = new NbtParser()
                parser.parseListOrArray(TEST_FAULT_ASSIGNMENT,0)
                assert.deepStrictEqual(parser.parsingProblems, [
                    {
                        range: {
                            start: 1,
                            end: 5
                        },
                        message: "Expected array type 'B', 'I' or 'L' but got: 'DUCK'.",
                        severity: 'warning'
                    }
                ])
            })
            it('Should produce duplicated assignment error', () => {
                const parser = new NbtParser()
                parser.parseListOrArray(TEST_DUPLICATED_ASSIGNMENT,0)
                assert.deepStrictEqual(parser.parsingProblems, [
                    {
                        range: {
                            start: 3,
                            end: 4
                        },
                        message: 'It seems that you are trying to assign the type twice.',
                        severity: 'warning'
                    }
                ])
            })
            it('Should produce fault type error of an array', () => {
                const parser = new NbtParser()
                parser.parseListOrArray(TEST_FAULT_TYPE_ARRAY, 0)
                assert.deepStrictEqual(parser.parsingProblems, [
                    {
                        range: {
                            start: 3,
                            end: 7
                        },
                        message: 'Detected current item type does not match previous detected types!',
                        severity: 'warning'
                    }
                ])
            })
            it('Should produce fault type error of an list', () => {
                const parser = new NbtParser()
                parser.parseListOrArray(TEST_FAULT_TYPE_LIST, 0)
                assert.deepStrictEqual(parser.parsingProblems, [
                    {
                        range: {
                            start: 5,
                            end: 6
                        },
                        message: 'Detected current item type does not match previous detected types!',
                        severity: 'warning'
                    }
                ])
            })
        })
    })
})
