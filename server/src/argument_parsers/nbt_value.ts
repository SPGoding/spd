import { ArgumentParser, ArgumentParseResult, ParsingError } from '../parser'

const NBT_INT_REGEX = /^[+-][0-9]+$/
const NBT_SHORT_REGEX = /^[+-][0-9]+[sS]$/
const NBT_LONG_REGEX = /^[+-][0-9]+[lL]$/
const NBT_BYTE_REGEX = /^([0-9]+[bB]|true|false)$/
const NBT_DOUBLE_REGEX = /^[+-]((\.[0-9]+)|([0-9]+\.)|([0-9]+\.[0-9]+)|[0-9]+[eE][0-9]+)$/
const NBT_FLOAT_REGEX = /^[+-]((\.[0-9]+)[fF]|([0-9]+\.)[fF]|([0-9]+\.[0-9]+)[fF]|[0-9]+[eE][0-9]+[fF])$/

export type NbtValue = NbtCompound | NbtList | NbtNumber | string

export interface NbtCompound {
    [key: string]: NbtValue
}

export interface NbtList {
    [index: number]: NbtValue
}

export type NbtNumberType = 'byte' | 'short' | 'long' | 'int' | 'float' | 'double'

export interface NbtNumber {
    type: NbtNumberType
    value: number
}

export class NbtParser implements ArgumentParser {

    parsingErrors: ParsingError[]

    parse(segments: string[], pos: number) : ArgumentParseResult {
        const nbt = segments[pos]
        return {argument: this.parseCompound(nbt, 0)[0], pos: pos + 1}
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
                    keyName = nbt.slice(startPos, i - 1).trim()
                    inVal = true
                    startPos = i + 1       
                }
                if(inVal) {
                    if(nbt[i] == '{') {
                        const result = this.parseCompound(nbt, i)
                        compound[keyName] = result[0] 
                        i = result[1]
                        inVal = false
                        startPos = nbt.slice(i, nbt.length - 1).search(',') + 1
                    }
                    if(nbt[i] == '[') {
                        const result = this.parseList(nbt, i)
                        compound[keyName] = result[0]
                        i = result[1]
                        inVal = false
                        startPos = nbt.slice(i, nbt.length - 1).search(',') + 1
                    }
                    if(nbt[i] == ',') {
                        const val = nbt.slice(startPos, i - 1).trim()
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

    parseList(nbt: string, pos: number) : [NbtList, number] {
        let inBody : boolean
        let startPos : number
        let itemIndex = 0
        const list : NbtList = {}
        for(let i = pos; i < nbt.length; i++) {
            if(!inBody && nbt[i] == '[') {
                inBody = true
                startPos = i + 1
            }
            if(inBody) {
                if(nbt[i] == '{') {
                    const result = this.parseCompound(nbt, i)
                    list[itemIndex] = result[0] 
                    itemIndex++
                    i = result[1]
                    startPos = nbt.slice(i, nbt.length - 1).search(',') + 1
                }
                if(nbt[i] == '[') {
                    const result = this.parseList(nbt, i)
                    list[itemIndex] = result[0]
                    itemIndex++
                    i = result[1]
                    startPos = nbt.slice(i, nbt.length - 1).search(',') + 1
                }
                if(nbt[i] == ',') {
                    const val = nbt.slice(startPos, i - 1).trim()
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
