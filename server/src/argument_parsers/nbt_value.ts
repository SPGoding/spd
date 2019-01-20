export type NbtValue = NbtCompound | NbtList | NbtNumber | string

export interface NbtCompound {
    [key: string]: NbtValue
}

export interface NbtList {
    [index: number]: NbtValue
}

export interface NbtNumber {
    value: number
    type: 'byte' | 'short' | 'integer' | 'long' | 'float' | 'double'
}
