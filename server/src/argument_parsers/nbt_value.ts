import { ArgumentParser, ArgumentParseResult, ParsingError } from '../parser'

const NBT_INT_REGEX = /^([+-]?)[0-9]+$/
const NBT_SHORT_REGEX = /^([+-]?)[0-9]+[sS]$/
const NBT_LONG_REGEX = /^([+-]?)[0-9]+[lL]$/
const NBT_BYTE_REGEX = /^([0-9]+[bB]|true|false)$/
const NBT_DOUBLE_REGEX = /^([+-]?)((\.[0-9]+)|([0-9]+\.)|([0-9]+\.[0-9]+)|[0-9]+[eE][0-9]+)([dD]?)$/
const NBT_FLOAT_REGEX = /^([+-]?)((\.[0-9]+)[fF]|([0-9]+\.)[fF]|([0-9]+\.[0-9]+)[fF]|[0-9]+[eE][0-9]+[fF])$/

const ESCAPE_PATTERN = /("|\\)/g
const UNESCAPE_PATTERN = /\\("|\\)/g

const UNQUOTED_SUPPORT = /[a-zA-Z0-9\-_\.]/

export function escape(data: string) {
    return data.replace(ESCAPE_PATTERN, '\\$1')
}
export function unescape(data: string) {
    return data.replace(UNESCAPE_PATTERN, '$1')
}

export function dequote(data: string) {
    return data.slice(data.search('"') + 1, data.lastIndexOf('"'))
}

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

    parsingErrors: ParsingError[] = []

    parse(segments: string): ArgumentParseResult {
        throw 'UnimplementedException'
        // return { argument: null, rest: null, cache: null, errors: this.parsingErrors }
    }

    parseCompound(nbt: string, pos: number): [NbtCompound, number] {
        let inBody = false
        let inVal = false
        let inQuote = false
        let wasInQuote = false
        let startPos = 0
        let compoundStart = 0
        let keyName = ''
        let stringStart = 0
        const compound: NbtCompound = {}
        for (let i = pos; i < nbt.length; i++) {
            if (!inBody && nbt[i] === '{') {
                inBody = true
                startPos = i + 1
                compoundStart = i
                continue
            }
            if (inBody) {
                if(nbt[i] === '"' && nbt[i - 1] !== '\\') {
                    if(!inQuote) {
                        stringStart = i
                    }
                    inQuote = !inQuote
                    wasInQuote = true
                }
                if(!inQuote) {
                    if (nbt[i] === ':') {
                        keyName = nbt.slice(startPos, i).trim()
                        if(wasInQuote) {
                            keyName = unescape(dequote(keyName))
                            wasInQuote = false
                        }
                        inVal = true
                        startPos = i + 1
                        continue
                    }
                    if (inVal) {
                        if (nbt[i] === '{') {
                            const result = this.parseCompound(nbt, i)
                            compound[keyName] = result[0]
                            const nextComma = nbt.slice(result[1], nbt.length).search(',')
                            i = result[1] + (nextComma === -1 ? 0 : nextComma)
                            inVal = false
                            startPos = i + 1
                            continue
                        }
                        if (nbt[i] === '[') {
                            const result = this.parseListOrArray(nbt, i)
                            compound[keyName] = result[0]
                            const nextComma = nbt.slice(result[1], nbt.length).search(',')
                            i = result[1] + (nextComma === -1 ? 0 : nextComma)
                            inVal = false
                            startPos = i + 1
                            continue
                        }
                        if (nbt[i] === ',' || nbt[i] === '}') {
                            const valStart = startPos
                            const val = nbt.slice(startPos, i).trim()
                            startPos = i + 1
                            const type = this.parseValueType(val)
                            inVal = false
                            if (type === 'string') {
                                if(!wasInQuote) {
                                    if(!UNQUOTED_SUPPORT.test(val)) {
                                        this.parsingErrors.push({
                                            range: { start: valStart, end: i },
                                            message: 'Unexpected char(s) detected in string!',
                                            severity: 'oops'
                                        })
                                    }
                                }
                                compound[keyName] = wasInQuote ? unescape(dequote(val)) : val
                                wasInQuote = false
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
        }
        this.parsingErrors.push({
            range: { start: inQuote ? stringStart : compoundStart, end: nbt.length },
            message: inQuote ? 'String not enclosing!' : 'Compound not enclosing!',
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
        let isLast = false
        const list: NbtList = { type: 'string' }
        for (let i = pos; i < nbt.length; i++) {
            if (!inBody && nbt[i] === '[') {
                inBody = true
                startPos = i + 1
                listStart = i
                continue
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
                    continue
                }
                if (nbt[i] === '{') {
                    const itemStart = i
                    const result = this.parseCompound(nbt, i)
                    const nextComma = nbt.slice(result[1], nbt.length).search(',')
                    i = result[1] + (nextComma === -1 ? 0 : nextComma)
                    if(nextComma === -1) {
                        isLast = true
                    }
                    if (!isArray && itemIndex === 0) {
                        list.type = 'compound'
                    }
                    if(list.type != 'compound') {
                        this.parsingErrors.push({
                            range: { start: itemStart, end: i - 1 },
                            message: 'Detected current item type does not match previous detected types!',
                            severity: 'oops'
                        })
                    }
                    list[itemIndex++] = result[0]
                    startPos = i + 1
                    continue
                }
                if (nbt[i] === '[') {
                    const itemStart = i
                    const result = this.parseListOrArray(nbt, i)
                    const nextComma = nbt.slice(result[1], nbt.length).search(',')
                    i = result[1] + (nextComma === -1 ? 1 : nextComma)
                    if (!isArray && itemIndex === 0) {
                        list.type = 'list'
                    }
                    if(list.type != 'list') {
                        this.parsingErrors.push({
                            range: { start: itemStart, end: i - 1 },
                            message: 'Detected current item type does not match previous detected types!',
                            severity: 'oops'
                        })
                    }
                    list[itemIndex++] = result[0]
                    startPos = i + 1
                    continue
                }
                if (nbt[i] === ',' || nbt[i] === ']' && !isLast) {
                    const val = nbt.slice(startPos, i).trim()
                    const type = this.parseValueType(val)
                    startPos = i + 1
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
                        list[itemIndex] = { type: type, value: parseInt(val) }
                    }
                    else if (type === 'byte') {
                        if (val[0] === '0' || val[0] === '1') {
                            list[itemIndex] = { type: type, value: val[0] === '0' ? 0 : 1 }
                        }
                        else {
                            list[itemIndex] = { type: type, value: val === 'false' ? 0 : 1 }
                        }
                    }
                    else if (type === 'double' || type === 'float') {
                        list[itemIndex] = { type: type, value: parseFloat(val) }
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
