import { ScormErrorCodes, ScormError } from "./errorcodes"

import Joi from "joi"

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
    private state?: {
        [key: string]: string
    }
    constructor() {
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
                    return "false"
                }
                return "true"
            },
            LMSCommit: () => {
                try {
                    this.commit()
                }
                catch (err) {
                    console.error(err)
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
                    return "false"
                }
                return "true"
            }
        }
        window.API = api
    }

    init() {
        // Legge e imposta this.state dal DB?
        this.state = {}
    }

    setValue(key: string, value: string): void {
        if (this.state === undefined) {
            throw new ScormError(ScormErrorCodes.Not_initialized)
        }

        const validated_value = this.validateValue(key, value, ValidateModes.SET)

        this.state[key as string] = validated_value
        //ritorna true se tutto è andato bene dopo aver valutato se key e value sono coerenti
    }

    validateValue(key: string, value: string, mode: ValidateModes) {
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
            throw new ScormError(ScormErrorCodes.Invalid_argument_error, `Key "${key}" is ivalid.`)
        }
        return value
    }

    getValue(key: string): string {
        if (this.state === undefined)
            throw new Error("API Init non è stato chiamato.")
        return this.state[key]
    }

    commit() {
        // Salvataggio dello this.state nel DB?        
    }

    finish() {
        // Eseguo il Dispose dell'api e non può essere più utilizzata se non si effettua un nuovo Init
        this.state = undefined
    }
}

export { ScormAPI }
/*
const h = new ScormAPI()
h.getValue(ScormKey.CmiCoreLessonLocation)*/