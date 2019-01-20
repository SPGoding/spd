"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringReader {
    constructor(value) {
        this.pos = 0;
        this.segments = value.split(/\s/g);
    }
    read(step = 1) {
        let ans;
        if (step > 0) {
            ans = this.segments.slice(this.pos, this.pos + step).join(' ');
        }
        this.pos += step;
        return ans;
    }
    peak(step = 1) {
        let ans;
        if (step > 0) {
            ans = this.segments.slice(this.pos, this.pos + step).join(' ');
        }
        return ans;
    }
}
exports.StringReader = StringReader;
//# sourceMappingURL=string_reader.js.map