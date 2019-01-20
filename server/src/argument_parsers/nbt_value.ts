import { ArgumentParser, ArgumentParseResult, ParsingError } from '../parser'

const NBT_INT_REGEX = /^[+-][0-9]+$/
const NBT_SHORT_REGEX = /^[+-][0-9]+s$/
const NBT_LONG_REGEX = /^[+-][0-9]+l$/
const NBT_BYTE_REGEX = /^([0-1]b|true|false)$/
const NBT_DOUBLE_REGEX = /^[+-]((\.[0-9]+)|([0-9]+\.)|([0-9]+\.[0-9]+)|[0-9]+[eE][0-9]+)$/
const NBT_FLOAT_REGEX = /^[+-]((\.[0-9]+)[fF]|([0-9]+\.)[fF]|([0-9]+\.[0-9]+)[fF]|[0-9]+[eE][0-9]+[fF])$/

export type NbtValue = NbtCompound | NbtList | NbtArray | NbtNumber | string

export interface NbtCompound {
    [key: string]: NbtValue
}

export interface NbtList {
    [index: number]: NbtValue
}

export type NbtNumberType = 'byte' | 'short' | 'long' | 'int' | 'float' | 'double'
export type NbtArrayType = 'L' | 'I' | 'B'

export interface NbtNumber {
    type: NbtNumberType
    value: number
}

export interface NbtArray {
    type: NbtArrayType
    value: number
}

export class NbtParser implements ArgumentParser {

    parsingErrors: ParsingError[]

    parse(segments: string[], pos: number) : ArgumentParseResult {
        const nbt = segments[pos]
        return {argument: this.parseCompound(nbt, 0)[0]}
    }

    parseCompound(nbt: string, pos: number) : [NbtCompound, number] {
        let inBody : boolean
        let inVal : boolean
        let startPos : number
        let keyName : string
        const compound : NbtCompound = {}
        for(let i = pos; i < nbt.length; i++) {
            if(!inBody && nbt[i] == '{') {
                inBody = true
                startPos = i + 1
            }
            if(inBody) {
                if(nbt[i] == ':') {
                    keyName = nbt.slice(startPos, i).trim()
                    inVal = true
                    startPos = i + 1       
                }
                if(inVal) {
                    if(nbt[i] == '{') {
                        const result = this.parseCompound(nbt, i)
                        compound[keyName] = result[0] 
                        i = result[1]
                        inVal = false
                        startPos = nbt.slice(i, nbt.length).search(',') + 1
                    }
                    if(nbt[i] == '[') {
                        const result = this.parseListOrArray(nbt, i)
                        compound[keyName] = result[0]
                        i = result[1]
                        inVal = false
                        startPos = nbt.slice(i, nbt.length).search(',') + 1
                    }
                    if(nbt[i] == ',') {
                        const val = nbt.slice(startPos, i).trim()
                        const type = this.parseValueType(val)
                        inVal = false
                        if(type == 'string') {
                            compound[keyName] = val
                        }
                        else if(type == 'int' || type == 'short' || type == 'long') {
                            compound[keyName] = {type: type, val: parseInt(val)}
                        }
                        else if(type == 'byte') {
                            if(val[0] == '0' || val[0] == '1') {
                                compound[keyName] = {type: type, val: val[0] == '0' ? 0 : 1}
                            }
                            else {
                                compound[keyName] = {type: type, val: val == 'false' ? 0 : 1}
                            }
                        }
                        else if(type == 'double' || type == 'float') {
                            compound[keyName] = {type: type, val: parseFloat(val)}
                        }
                    }
                }
                if(nbt[i] == '}') {
                    inBody = false
                    return [compound, i]
                }
            }
        }
        return [compound, -1]
    }

    parseListOrArray(nbt: string, pos: number) : [NbtList | NbtArray, number] {
        let inBody : boolean
        let startPos : number
        let itemIndex = 0
        let isArray = false
        const list : NbtList | NbtArray = {}
        for(let i = pos; i < nbt.length; i++) {
            if(!inBody && nbt[i] == '[') {
                inBody = true
                startPos = i + 1
            }
            if(inBody) {
                if(nbt[i] == 'L' && itemIndex == 0 && this.parseValueType(nbt.slice(startPos, i + 1).trim()) == 'string') {
                    isArray = true
                }
                if(nbt[i] == '{') {
                    const result = this.parseCompound(nbt, i)
                    list[itemIndex] = result[0] 
                    itemIndex++
                    i = result[1]
                    startPos = nbt.slice(i, nbt.length).search(',') + 1
                }
                if(nbt[i] == '[') {
                    const result = this.parseListOrArray(nbt, i)
                    list[itemIndex] = result[0]
                    itemIndex++
                    i = result[1]
                    startPos = nbt.slice(i, nbt.length).search(',') + 1
                }
                if(nbt[i] == ',') {
                    if(isArray && itemIndex == 0) {
                        itemIndex++
                        continue
                    }
                    const val = nbt.slice(startPos, i).trim()
                    const type = this.parseValueType(val)
                    if(type == 'string') {
                        list[itemIndex] = val
                    }
                    else if(type == 'int' || type == 'short' || type == 'long') {
                        list[itemIndex] = {type: type, val: parseInt(val)}
                    }
                    else if(type == 'byte') {
                        if(val[0] == '0' || val[0] == '1') {
                            list[itemIndex] = {type: type, val: val[0] == '0' ? 0 : 1}
                        }
                        else {
                            list[itemIndex] = {type: type, val: val == 'false' ? 0 : 1}
                        }
                    }
                    else if(type == 'double' || type == 'float') {
                        list[itemIndex] = {type: type, val: parseFloat(val)}
                    }
                    itemIndex++
                }
                if(nbt[i] == ']') {
                    inBody = false
                    return [list, i]
                }
            }
        }
        return [list, -1]
    }

    parseValueType(num: string) : NbtNumberType | 'string' {
        const regexs : [RegExp, NbtNumberType][] = [
            [NBT_INT_REGEX, 'int'],
            [NBT_SHORT_REGEX, 'short'],
            [NBT_LONG_REGEX, 'long'],
            [NBT_BYTE_REGEX, 'byte'],
            [NBT_FLOAT_REGEX, 'float'],
            [NBT_DOUBLE_REGEX, 'double']
        ]
        for(const regex of regexs) {
            if(regex[0].test(num)) {
                return regex[1]
            }
        }
        return 'string'
    }
}
