import * as assert from 'power-assert'
import { describe, it } from 'mocha'
import { CommandParser } from '../../argument_parsers/command'
import { CommandTreeNode } from '../../utils/types'

const parser = new CommandParser()

//#region Test data
/**
 * Allows: `foo|bar`
 */
const twoNodesArray: CommandTreeNode[] = [{
    parser: 'literal',
    params: { expected: ['foo'] },
    executable: true
}, {
    parser: 'literal',
    params: { expected: ['bar'] },
    executable: true
}]

/**
 * Allows: `foo`
 */
const oneNodeArray: CommandTreeNode[] = [{
    parser: 'literal',
    params: { expected: ['foo'] },
    executable: true
}]

/**
 * Allows: `qux foo|bar`
 */
const deepNode: CommandTreeNode = {
    parser: 'literal',
    params: { expected: ['qux'] },
    children: twoNodesArray
}
//#endregion

describe.only('CommandParser tests', () => {
    describe('parseNodes() tests', () => {
        it('Should parse when value matches the first node', () => {
            const result = parser.parseNodes('foo', twoNodesArray, [], 0, 0)

            assert.deepStrictEqual(result, {
                argument: {
                    args: [{ type: 'literal', value: 'foo' }], cache: {}, errors: []
                }, rest: '', cache: {}, errors: []
            })
        })
        it('Should parse when value matches the second node', () => {
            const result = parser.parseNodes('bar', twoNodesArray, [], 0, 0)

            assert.deepStrictEqual(result, {
                argument: {
                    args: [{ type: 'literal', value: 'bar' }], cache: {}, errors: []
                }, rest: '', cache: {}, errors: []
            })
        })
        it('Should return error when value fails to match all nodes', () => {
            const result = parser.parseNodes('baz', twoNodesArray, [], 0, 0)

            assert.deepStrictEqual(result, {
                argument: {
                    args: [{ type: 'error', value: 'baz' }], cache: {},
                    errors: [{
                        range: { start: 0, end: 3 },
                        message: 'Failed to match all nodes.',
                        severity: 'error'
                    }]
                },
                errors: [{
                    range: { start: 0, end: 3 },
                    message: 'Failed to match all nodes.',
                    severity: 'error'
                }], rest: '', cache: {}
            })
        })
        it('Should return error when value fails to match the only node', () => {
            const result = parser.parseNodes('bar', oneNodeArray, [], 0, 0)

            assert.deepStrictEqual(result, {
                argument: {
                    args: [{ type: 'literal', value: 'bar' }], cache: {},
                    errors: [{
                        range: { start: 0, end: 3 },
                        message: "Expected 'foo' but got 'bar'.",
                        severity: 'error'
                    }]
                },
                errors: [{
                    range: { start: 0, end: 3 },
                    message: "Expected 'foo' but got 'bar'.",
                    severity: 'error'
                }], rest: '', cache: {}
            })
        })
    })
    describe('parseOneNode() tests', () => {
        it('Should parse children', () => {
            const result = parser.parseOneNode('qux bar', deepNode, [], 0, 0)

            assert.deepStrictEqual(result, {
                argument: {
                    args: [{ type: 'literal', value: 'qux' }, { type: 'literal', value: 'bar' }],
                    cache: {}, errors: []
                },
                rest: '', cache: {}, errors: []
            })
        })
        it('Should return error when the second parser returns error', () => {
            const result = parser.parseOneNode('qux baz', deepNode, [], 0, 0)

            assert.deepStrictEqual(result, {
                argument: {
                    args: [{ type: 'literal', value: 'qux' }, { type: 'error', value: 'baz' }],
                    cache: {}, errors: [{
                        range: { start: 4, end: 7 }, severity: 'warning',
                        message: 'Failed to match all nodes.'
                    }]
                }, errors: [{
                    range: { start: 4, end: 7 }, severity: 'warning',
                    message: 'Failed to match all nodes.'
                }],
                rest: '', cache: {}
            })
        })
    })
}) 
