import { ArgumentParser, ArgumentParseResult, ParsingProblem } from '../parser'

const NBT_INT_REGEX = /^([+-]?)[0-9]+$/
const NBT_SHORT_REGEX = /^([+-]?)[0-9]+[sS]$/
const NBT_LONG_REGEX = /^([+-]?)[0-9]+[lL]$/
const NBT_BYTE_REGEX = /^([0-9]+[bB]|[Tt][Rr][Uu][Ee]|[Ff][Aa][Ll][Ss][Ee])$/
const NBT_DOUBLE_REGEX = /^([+-]?)((\.[0-9]+)|([0-9]+\.)|([0-9]+\.[0-9]+)|[0-9]+[eE][0-9]+)([dD]?)$/
const NBT_FLOAT_REGEX = /^([+-]?)((\.[0-9]+)[fF]|([0-9]+\.)[fF]|([0-9]+\.[0-9]+)[fF]|[0-9]+[eE][0-9]+[fF])$/

const ESCAPE_PATTERN = /("|\\)/g
const UNESCAPE_PATTERN = /\\("|\\)/g

const UNQUOTED_SUPPORT = /[a-zA-Z0-9\-_\.]/

const BYTE_RANGE = [-128, 127]
const SHORT_RANGE = [-32768, 32767]
const INT_RANGE = [-2147483648, 2147483647]
const LONG_RANGE = [-9223372036854775808, 9223372036854775807]
const FLOAT_RANGE = [-3.4E38, 3.4E38]
const DOUBLE_RANGE = [-1.8E308, 1.8E308]

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

    parsingProblems: ParsingProblem[] = []

    parse(value: string, cursor: number | undefined, params: object /* NbtStructureTree */): ArgumentParseResult {
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
                if (nbt[i] === '"' && nbt[i - 1] !== '\\') {
                    if (!inQuote) {
                        stringStart = i
                    }
                    inQuote = !inQuote
                    wasInQuote = true
                }
                if (!inQuote) {
                    if (nbt[i] === ':') {
                        keyName = nbt.slice(startPos, i).trim()
                        if (wasInQuote) {
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
                                if (!wasInQuote) {
                                    if (!UNQUOTED_SUPPORT.test(val)) {
                                        this.parsingProblems.push({
                                            range: { start: valStart, end: i },
                                            message: 'Unexpected char(s) detected in string!',
                                            severity: 'warning'
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
        this.parsingProblems.push({
            range: { start: inQuote ? stringStart : compoundStart, end: nbt.length },
            message: inQuote ? 'String not enclosing!' : 'Compound not enclosing!',
            severity: 'warning'
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
        let inQuote = false
        let wasInQuote = false
        let stringStart = 0
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
                    if(list.type != 'string') {
                        this.parsingProblems.push({
                            range: { start: startPos, end: i },
                            message: 'It seems that you are trying to assign the type twice.',
                            severity: 'warning'
                        })
                        startPos = i + 1
                        continue
                    }
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
                        this.parsingProblems.push({
                            range: { start: startPos, end: i },
                            message: 'Considering it is an array, but met unexpected type assignment!',
                            severity: 'warning'
                        })
                    }
                    startPos = i + 1
                    continue
                }
                if(nbt[i] === '"' && nbt[i - 1] !== '\\') {
                    if(!inQuote) {
                        stringStart = i
                    }
                    inQuote = !inQuote
                    wasInQuote = true
                }
                if(!inQuote) {
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
                            this.parsingProblems.push({
                                range: { start: itemStart, end: i },
                                message: 'Detected current item type does not match previous detected types!',
                                severity: 'warning'
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
                            this.parsingProblems.push({
                                range: { start: itemStart, end: i },
                                message: 'Detected current item type does not match previous detected types!',
                                severity: 'warning'
                            })
                        }
                        list[itemIndex++] = result[0]
                        startPos = i + 1
                        continue
                    }
                    if (nbt[i] === ',' || nbt[i] === ']' && !isLast) {
                        const valStart = startPos
                        const val = nbt.slice(startPos, i).trim()
                        const type = this.parseValueType(val)
                        startPos = i + 1
                        if (!isArray && itemIndex === 0) {
                            list.type = type
                        }
                        if (list.type != type) {
                            this.parsingProblems.push({
                                range: { start: valStart, end: i },
                                message: 'Detected current item type does not match previous detected types!',
                                severity: 'warning'
                            })
                        }
                        if (type === 'string') {
                            if(!wasInQuote) {
                                if(!UNQUOTED_SUPPORT.test(val)) {
                                    this.parsingProblems.push({
                                        range: { start: valStart, end: i },
                                        message: 'Unexpected char(s) detected in string!',
                                        severity: 'warning'
                                    })
                                }
                            }
                            list[itemIndex] = wasInQuote ? unescape(dequote(val)) : val
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
        }
        this.parsingProblems.push({
            range: { start: inQuote ? stringStart : listStart, end: nbt.length },
            message: inQuote ? 'String not enclosing!' : 'List not enclosing!',
            severity: 'warning'
        })
        return [list, -1]
    }

    parseValueType(num: string): NbtNumberType | 'string' {
        const regexs: [RegExp, NbtNumberType, number[]][] = [
            [NBT_INT_REGEX, 'int', INT_RANGE],
            [NBT_SHORT_REGEX, 'short', SHORT_RANGE],
            [NBT_LONG_REGEX, 'long', LONG_RANGE],
            [NBT_BYTE_REGEX, 'byte', BYTE_RANGE],
            [NBT_FLOAT_REGEX, 'float', FLOAT_RANGE],
            [NBT_DOUBLE_REGEX, 'double', DOUBLE_RANGE]
        ]
        for (const regex of regexs) {
            if (regex[0].test(num)) {
                let n = 0
                if(regex[1] == 'float' || regex[1] == 'double') {
                    n = parseFloat(num)
                }
                else {
                    n = parseInt(num)
                }
                if(n >= regex[2][0] && n <= regex[2][1]) {
                    return regex[1]
                }
            }
        }
        return 'string'
    }
}
