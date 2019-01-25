import { ArgumentParser, ArgumentParseResult, ParsingError } from '../parser'

const NBT_INT_REGEX = /^([+-]?)[0-9]+$/
const NBT_SHORT_REGEX = /^([+-]?)[0-9]+[sS]$/
const NBT_LONG_REGEX = /^([+-]?)[0-9]+[lL]$/
const NBT_BYTE_REGEX = /^([0-9]+[bB]|true|false)$/
const NBT_DOUBLE_REGEX = /^([+-]?)((\.[0-9]+)|([0-9]+\.)|([0-9]+\.[0-9]+)|[0-9]+[eE][0-9]+)$/
const NBT_FLOAT_REGEX = /^([+-]?)((\.[0-9]+)[fF]|([0-9]+\.)[fF]|([0-9]+\.[0-9]+)[fF]|[0-9]+[eE][0-9]+[fF])$/

export type NbtValue = NbtCompound | NbtList | NbtNumber | string

export interface NbtCompound {
    [key: string]: NbtValue
}

export interface NbtList {
    [index: number]: NbtValue
    type: NbtValueType
}

export type NbtNumberType = 'byte' | 'short' | 'long' | 'int' | 'float' | 'double'
export type NbtValueType = NbtNumberType | 'string' | 'list' | 'compound'

export interface NbtNumber {
    type: NbtNumberType
    value: number
}

export class NbtParser implements ArgumentParser {

    parsingErrors: ParsingError[]

    parse(segments: string): ArgumentParseResult {
        throw 'UnimplementedException'
        // return { argument: null, rest: null, cache: null, errors: this.parsingErrors }
    }

    parseCompound(nbt: string, pos: number): [NbtCompound, number] {
        let inBody = false
        let inVal = false
        let startPos = 0
        let compoundStart = 0
        let keyName = ''
        const compound: NbtCompound = {}
        for (let i = pos; i < nbt.length; i++) {
            if (!inBody && nbt[i] === '{') {
                inBody = true
                startPos = i + 1
                compoundStart = i
            }
            if (inBody) {
                if (nbt[i] === ':') {
                    keyName = nbt.slice(startPos, i).trim()
                    inVal = true
                    startPos = i + 1
                }
                if (inVal) {
                    if (nbt[i] === '{') {
                        const result = this.parseCompound(nbt, i)
                        compound[keyName] = result[0]
                        i = nbt.slice(result[1], nbt.length).search(',') + result[1] + 1
                        inVal = false
                        startPos = i
                    }
                    if (nbt[i] === '[') {
                        const result = this.parseListOrArray(nbt, i)
                        compound[keyName] = result[0]
                        i = nbt.slice(result[1], nbt.length).search(',') + result[1] + 1
                        inVal = false
                        startPos = i
                    }
                    if (nbt[i] === ',' || nbt[i] === '}') {
                        const val = nbt.slice(startPos, i).trim()
                        startPos = i + 1
                        const type = this.parseValueType(val)
                        inVal = false
                        if (type === 'string') {
                            compound[keyName] = val
                        }
                        else if (type === 'int' || type === 'short' || type === 'long') {
                            compound[keyName] = { type: type, value: parseInt(val) }
                        }
                        else if (type === 'byte') {
                            if (val[0] === '0' || val[0] === '1') {
                                compound[keyName] = { type: type, value: val[0] === '0' ? 0 : 1 }
                            }
                            else {
                                compound[keyName] = { type: type, value: val === 'false' ? 0 : 1 }
                            }
                        }
                        else if (type === 'double' || type === 'float') {
                            compound[keyName] = { type: type, value: parseFloat(val) }
                        }
                    }
                }
                if (nbt[i] === '}') {
                    inBody = false
                    return [compound, i]
                }
            }
        }
        this.parsingErrors.push({
            range: { start: compoundStart, end: nbt.length },
            message: 'Compound not enclosing!',
            severity: 'oops'
        })
        return [compound, -1]
    }

    parseListOrArray(nbt: string, pos: number): [NbtList, number] {
        let inBody = false
        let startPos = 0
        let listStart = 0
        let itemIndex = 0
        let isArray = false
        const list: NbtList = { type: 'string' }
        for (let i = pos; i < nbt.length; i++) {
            if (!inBody && nbt[i] === '[') {
                inBody = true
                startPos = i + 1
                listStart = i
            }
            if (inBody) {
                if (nbt[i] === ';' && itemIndex === 0) {
                    isArray = true
                    const typeIdentity = nbt.slice(startPos, i).trim()
                    if (typeIdentity === 'L') {
                        list.type = 'long'
                    }
                    else if (typeIdentity === 'I') {
                        list.type = 'int'
                    }
                    else if (typeIdentity === 'B') {
                        list.type = 'byte'
                    }
                    else {
                        this.parsingErrors.push({
                            range: { start: startPos, end: i },
                            message: 'Considering it is an array, but met unexpected type assignment!',
                            severity: 'oops'
                        })
                    }
                }
                if (nbt[i] === '{') {
                    const result = this.parseCompound(nbt, i)
                    list[itemIndex] = result[0]
                    i = nbt.slice(result[1], nbt.length).search(',') + result[1] + 1
                    startPos = i
                }
                if (nbt[i] === '[') {
                    const result = this.parseListOrArray(nbt, i)
                    list[itemIndex++] = result[0]
                    i = nbt.slice(result[1], nbt.length).search(',') + result[1] + 1
                    startPos = i
                }
                if (nbt[i] === ',') {
                    const val = nbt.slice(startPos, i).trim()
                    const type = this.parseValueType(val)
                    if (!isArray && itemIndex === 0) {
                        list.type = type
                    }
                    if (list.type != type) {
                        this.parsingErrors.push({
                            range: { start: startPos, end: i - 1 },
                            message: 'Detected current item type does not match previous detected types!',
                            severity: 'oops'
                        })
                    }
                    if (type === 'string') {
                        list[itemIndex] = val
                    }
                    else if (type === 'int' || type === 'short' || type === 'long') {
                        list[itemIndex] = { type: type, val: parseInt(val) }
                    }
                    else if (type === 'byte') {
                        if (val[0] === '0' || val[0] === '1') {
                            list[itemIndex] = { type: type, val: val[0] === '0' ? 0 : 1 }
                        }
                        else {
                            list[itemIndex] = { type: type, val: val === 'false' ? 0 : 1 }
                        }
                    }
                    else if (type === 'double' || type === 'float') {
                        list[itemIndex] = { type: type, val: parseFloat(val) }
                    }
                    itemIndex++
                }
                if (nbt[i] === ']') {
                    inBody = false
                    return [list, i]
                }
            }
        }
        this.parsingErrors.push({
            range: { start: listStart, end: nbt.length },
            message: 'List not enclosing!',
            severity: 'oops'
        })
        return [list, -1]
    }

    parseValueType(num: string): NbtNumberType | 'string' {
        const regexs: [RegExp, NbtNumberType][] = [
            [NBT_INT_REGEX, 'int'],
            [NBT_SHORT_REGEX, 'short'],
            [NBT_LONG_REGEX, 'long'],
            [NBT_BYTE_REGEX, 'byte'],
            [NBT_FLOAT_REGEX, 'float'],
            [NBT_DOUBLE_REGEX, 'double']
        ]
        for (const regex of regexs) {
            if (regex[0].test(num)) {
                return regex[1]
            }
        }
        return 'string'
    }
}
