import { Converter } from "./converter";
import fs from 'fs';
import path from 'path';
import humanizeDuration from 'humanize-duration';

(async () => {
    let toconvert = 100 // Numero di Operazioni da effetturare (records su cui lavorare...)
    let executing = 0
    let done = false
    const processors = 4; // Numero di task concorrenti che possono essere eseguiti in modo asyncrono
    const destination = 'out'

    console.log(">> Inizio Automazione 1.")
    console.log(" - Destinazione: %o", path.resolve(destination))
    if (fs.existsSync(destination)) {
        fs.rmSync(destination, {
            recursive: true
        })
    }
    fs.mkdirSync(destination)
    let time = performance.now()
    while (!done || executing > 0) {
        if (executing < processors && toconvert > 0) {
            const converter = new Converter(toconvert.toString(), 'esempio.txt', path.join(destination, 'esempio' + toconvert + '.json'))
            toconvert--
            executing++
            converter.load().then(async () => {
                await converter.write()
                executing--
                if (toconvert == 0)
                    done = true
            })
        }
        await new Promise(resolve => setTimeout(resolve, 10))

    }

    console.log("<< Automazione 1 terminata in %o", humanizeDuration(performance.now() - time))
})()