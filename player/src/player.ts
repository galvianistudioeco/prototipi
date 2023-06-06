import { ScormAPI } from "./scormapi";
import "./style.css"

class Player    {
    readonly course_frame: HTMLIFrameElement
    private scorm_api?: ScormAPI;
    constructor() {          
        console.log("Constructed")
        
        //this.scorm_api = undefined
        /* acquireHTMLComponents */
        this.course_frame = document.getElementById('course_frame')! as HTMLIFrameElement        
    }

    loadCourse(url: string) {
        this.initScormAPI()
        this.course_frame.src = url
    }
    initScormAPI() {
        // Crea l'oggetto window.API e lo rendeusabile dal corso
        if (this.scorm_api === undefined)
            this.scorm_api = new ScormAPI()        
    }
}


const player = new Player()
player.loadCourse("../../course/dist/course.html")
player.loadCourse("../../course/dist/course.html")


