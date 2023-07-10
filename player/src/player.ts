import { ScormAPI } from "./scormapi";
import "./style.css"

export class Player {
    readonly course_frame: HTMLIFrameElement
    private scorm_api?: ScormAPI;
    constructor() {
        console.log("Constructed")

        //this.scorm_api = undefined
        /* acquireHTMLComponents */
        this.course_frame = document.getElementById('course_frame')! as HTMLIFrameElement
    }

    async loadCourse(url: string) {
        const allok = await this.initScormAPI()
        if (allok)
            this.course_frame.src = url
        else {

        }
        // Se il preload dello state dal DB non riesce allora non carichiamo il corso perchè qualcosa di grave è successo.    
    }
    
    closeCourseForError(errorMessage: string = "CORSO CHIUSO per errore!") {
        // L'API può invocare questo metodo per dichiarare errori critici
        document.getElementsByTagName('body')[0].innerHTML = errorMessage
    }
    
    async initScormAPI() {
        // Crea l'oggetto window.API e lo rendeusabile dal corso
        if (this.scorm_api === undefined) {
            this.scorm_api = new ScormAPI(this, window)

            // Se il preload dello state dal DB non riesce allora torniamo FALSE
            return await this.scorm_api.preloadState()
        }
        return true // Già inizializzata correttamente
    }
}


const player = new Player()
player.loadCourse("../../course/dist/E2921/default.html?t=swColdiretti&u=ud01")


