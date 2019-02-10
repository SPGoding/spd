import * as fs from 'fs'

const VANILLA_COMMANDS = JSON.parse(fs.readFileSync('../../../ref/commands_vanilla.json').toString())

function convert(object: any, key: string): any {
    const children = object.children
    let keys: string[] = []
    let nextgens: any[] = []
    let result: any
    if (children) {
        nextgens = []
        keys = Object.keys(children)
        for (const v of keys) {
            nextgens.push(convert(children[v], v))
        }
    }
    if (object.type === 'literal') {
        result = {
            parser: 'literal',
            params: {
                expected: [key]
            }
        }
    }
    else if (object.type === 'argument') {
        result = {
            parser: object.parser,
            params: object.properties
        }
    }
    result.description = key
    if(children) {
        result.children = nextgens
    }
    if(object.executable) {
        result.executable = true
    }
    if(object.redirect) {
        result.redirect = object.redirect
    }
    return result
}

function improve(object: any) : any {

}

const children = VANILLA_COMMANDS.children
const keys = Object.keys(children)
const nextgens: any[] = []
for (const v of keys) {
    nextgens.push(convert(children[v], v))
}

fs.writeFileSync('../../../ref/commands_spg_style.json', JSON.stringify(nextgens))
