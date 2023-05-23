export class Sottitolo {
    start: string
    end: string
    text: string
    constructor(linea: string) {
        const [start, end] = linea.substring(0, 18).trim().split(' ')
        const text = linea.substring(18).trim()
        //console.log(`Start: ${start}, End: ${end}, Text: ${text}`)
        this.start = start
        this.end = end
        this.text = text
    }
}