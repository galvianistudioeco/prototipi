import { ScormErrorCodes, ScormError } from "./errorcodes"

import Joi from "joi"
import axios from 'axios';
import { ScormAPIResponse, ScormState } from "./scormapireponse";
import { Player } from "./player";

interface IAPIScorm {
    LMSInitialize(): string
    LMSGetValue(key: string): string
    LMSSetValue(key: string, value: string): string
    LMSCommit(): string
    LMSFinish(): string
}


declare global {
    interface Window {
        API: IAPIScorm;
    }
}

enum ValidateModes {
    GET,
    SET
}

// cmi.core.lesson_location
// cmi.core.lesson_status
// cmi.core.score.raw

class ScormAPI {
    private last_error?: ScormError = undefined
    private state?: ScormState
    private saved_state?: ScormState
    constructor(private readonly player: Player) {
        const api: IAPIScorm = {
            LMSInitialize: () => {
                this.init()
                return "true"
            },
            LMSGetValue: (key: string) => {
                try {
                    return this.getValue(key)
                }
                catch (err) {
                    this.player.closeCourseForError()   
                    console.error(err)
                    return "false"
                }
            },
            LMSSetValue: (key: string, value: string) => {
                try {
                    this.setValue(key, value)
                }
                catch (err: any) {
                    if (ScormError.is(err)) {
                        this.last_error = err
                    } else {
                        this.last_error = new ScormError(ScormErrorCodes.General_Exception, err.message)
                    }
                    console.error("Error:", this.last_error.code, this.last_error.message)
                    this.player.closeCourseForError()   
                    return "false"
                }
                return "true"
            },
            LMSCommit: () => {
                try {
                    // Scorm non gestiscela chiamata asincrona sul commit,
                    //       quindi assumiamo che commit torni sempre TRUE,
                    //       che l'errore del commit venga salvato per essere
                    //       gestito alla prossima chiamata API(qualsiasi) ed eventualmente
                    //       gestito al ritorno della chiamata asyncrona
                    this.commit()
                }
                catch (err) {
                    console.error(err)
                    this.player.closeCourseForError()   
                    return "false"
                }
                return "true"
            },
            LMSFinish: () => {
                try {
                    this.finish()
                }
                catch (err) {
                    console.error(err)
                    this.player.closeCourseForError()   
                    return "false"
                }
                return "true"
            }
        }
        window.API = api
    }
    async preloadState() {
        try {
            const ret = await axios.get<ScormAPIResponse>('http://127.0.0.1:3001/init')
            if (ret.status != 200) {
                throw new Error("Risposta del server non è 200 ma " + ret.status + ": " + ret.statusText)
            }
            console.log("AXIOS Returns", ret.data)
            const responseData = ret.data
            if (responseData.errorMessage)
                throw new Error("Risposta del server 200 ma c'è un errore interno. " + ret.data.errorMessage)

            this.saved_state = responseData.state || {}

        } catch (err: any) {
            this.last_error = new ScormError(ScormErrorCodes.General_Exception, err.message)
            return false
        }
        return true
    }

    init() {
        if (this.last_error) {
            throw this.last_error
        }
        this.state = this.saved_state || {}
    }

    setValue(key: string, value: string): void {        
        if (this.state === undefined) {
            throw new ScormError(ScormErrorCodes.Not_initialized)
        }

        const validated_value = this.validateKeyValue(key, value, ValidateModes.SET)

        this.state[key as string] = validated_value!

        console.log("Lo state è", this.state)
        //ritorna true se tutto è andato bene dopo aver valutato se key e value sono coerenti
    }

    validateKeyValue(key: string, value: string | undefined, mode: ValidateModes) {
        if (this.last_error) {
            throw this.last_error
        }
        if (mode == ValidateModes.SET && value === undefined) {
            throw new ScormError(ScormErrorCodes.Invalid_set_value, "Value non è valorizzato.")
        }
        if (key === "cmi.core.lesson_location") {
            // (CMIString (SPM: 255), RW) The learner’s current location in the SCO
            if (mode == ValidateModes.SET) {
                const validation = Joi.string().max(255).required().validate(value, {
                    abortEarly: true
                })
                if (validation.error) {
                    throw new ScormError(ScormErrorCodes.Incorrect_Data_Type, validation.error.message)
                }
            }

        } else if (key === "cmi.core.student_name") {
            //(CMIString (SPM: 255), RO) Name provided for the student by the LMS

            if (mode == ValidateModes.SET)
                throw new ScormError(ScormErrorCodes.Element_is_read_only, `Key "${key}" is readonly.`)
        } else {
            // A scopo didattico non gestiamo l'evento key non supportato.
            // throw new ScormError(ScormErrorCodes.Invalid_argument_error, `Key "${key}" is ivalid.`)
        }
        return value
    }

    getValue(key: string): string {
        if (this.state === undefined) 
            throw new Error("API Init non è stato chiamato.")        

        this.validateKeyValue(key, undefined, ValidateModes.GET)

        return this.state[key]
    }

    async commit() {
        // Salvataggio dello this.state nel DB?   
        try {
            const ret = await axios.post<ScormAPIResponse>('http://127.0.0.1:3001/commit', this.state/*, {
                withCredentials: true
            }*/)
            /*if (ret.status == 0) {
                setTimeout(this.commit, 1000)
                return
            }*/
            if (ret.status != 200) {
                throw new Error("Risposta del server non è 200 ma " + ret.status + ": " + ret.statusText)
            }
            console.log("AXIOS Returns", ret.data)
            const responseData = ret.data
            if (responseData.errorMessage)
                throw new Error("Risposta del server 200 ma c'è un errore interno. " + ret.data.errorMessage)

        } catch (err: any) {
            this.last_error = new ScormError(ScormErrorCodes.General_Exception, err.message)
            // Redirect della pagina con un messaggio di errore
            // "Comunicazione interrotta con il sever" -> Logout.html
            console.error("ERRORE CRITICO", err)
            console.error("DOBBIAMO A QUESTO PUNTO CHIAMARE IL LOGOUT")
            this.player.closeCourseForError()
        }

        /*.then(function(response) {
            // handle success
            console.log(response);
        })
        .catch(function(error) {
            // handle error
            console.log(error);
        })
        .finally(function() {
            // always executed
        });*/
    }

    finish() {
        if (this.last_error) {
            this.player.closeCourseForError()   
            throw this.last_error
        }
        // Eseguo il Dispose dell'api e non può essere più utilizzata se non si effettua un nuovo Init
        this.saved_state = this.state
        this.state = undefined
    }
}

export { ScormAPI }
/*
const h = new ScormAPI()
h.getValue(ScormKey.CmiCoreLessonLocation)*/