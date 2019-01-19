export class StringReader {
    private segments: string[]
    private pos: number = 0

    constructor(value: string) {
        this.segments = value.split(/\s/g)
    }

    read(step: number = 1) {
        let ans: string

        if (step > 0) {
            ans = this.segments.slice(this.pos, this.pos + step).join(' ')
        }
        
        this.pos += step
        return ans
    }
}
