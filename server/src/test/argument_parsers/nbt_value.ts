import { NbtParser } from '../../argument_parsers/nbt_value'
import * as assert from 'power-assert'

const TEST_NBT_COMPOUND = '{CustomNameVisible:1b,Invulnerable:1b,Age:1s,spg:{test:fork},UUID:abcd-blahblahblahblah,double:0.0,float:0.0F,long:10000L}'

describe('NbtParser tests', () => {
    describe('parseCompound() tests', () => {
        it('should return a well-parsed NBT compound', () => {
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
    })
})
