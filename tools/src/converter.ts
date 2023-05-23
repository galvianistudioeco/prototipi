import { Sottitolo } from "./sottotitolo"
import { VTTFile } from "./vttfile"
import fs from 'fs'

export class Converter {
    vttFile?: VTTFile

    constructor(private readonly id: string, private readonly input: string, private readonly output: string) {

    }
    async load() {
        console.log("%o: caricamento %o..",this.id,this.input)
        return new Promise(resolve => {
            const esempio = fs.readFileSync(this.input).toString()

            // Analizzarlo
            const linee = esempio.replaceAll('\r', '').split('\n')

            const mynewFile = new VTTFile()

            linee.forEach(linea => {
                const vtt = new Sottitolo(linea)
                mynewFile.add(vtt)
                //console.log(vtt)
            })
            this.vttFile = mynewFile            
            setTimeout(() => {
                console.log("%o: caricato %o", this.id, this.input)
                resolve(true)
            },  1000)


        })
    }
    async write() {
        console.log("%o: scrittura in %o...", this.id, this.output)
        return new Promise(resolve => {
            if (this.vttFile !== undefined)
                fs.writeFileSync(this.output, this.vttFile.toString())
            else
                throw new Error("Devi chiamare prima il load")
            
            console.log("%o: scritto in %o", this.id, this.output)
            resolve(true)
        });
    }
}