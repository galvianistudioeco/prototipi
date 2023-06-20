console.log("Server started!")

import { ScormAPIResponse } from "../../player/src/scormapireponse";

import express, { Request, Response } from 'express';
import cors from 'cors'
import fs from 'fs'

const app = express()

const port = 3001

const database_file = `./database.json`

// Middleware
app.use(cors())
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
    console.log("Risposta alla get /")
    res.statusCode = 403
    res.statusMessage = "Forbidden"
    res.send("Unauthorized. Please use a proper route.")
})

app.get('/init', (req: Request, res: Response) => {

    if (!fs.existsSync(database_file)) {
        res.send({})
        return
    }
    const state = JSON.parse(fs.readFileSync(database_file).toString())

    res.send({
        state
    })

})

app.post('/commit', (req: Request, res: Response) => {

    console.log("Sono nel commit:")

    const result: ScormAPIResponse = {
        errorMessage: "non ancora implementato"
    }


    const state = req.body

    /* tutto è coerente */
    // JOI
    // calidate state con JOI


    /* SALVIAMO LO STATE UTENTE SUL DATABASE */
    const stateSerialized = JSON.stringify(state)



    fs.writeFileSync(database_file, stateSerialized)

    delete result.errorMessage
    res.send("testo di prova")
})



app.listen(port, () => {
    console.log(`🔌 [server]: Server is running 2 at http://localhost:${port}`)
})