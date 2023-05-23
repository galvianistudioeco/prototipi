import { Sottitolo } from "./sottotitolo"

export class VTTFile {
    sottotitoli: Sottitolo[] = []
    constructor() {

    }
    add(vtt: Sottitolo) {
        this.sottotitoli.push(vtt)
    }
    toString() {
        return JSON.stringify(this, undefined, 2)
    }
}