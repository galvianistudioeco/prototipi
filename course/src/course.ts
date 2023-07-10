import "./main.css"
import macro from "./macro.json"

class Course {
    private app_title: HTMLHeadingElement
    constructor() {
        this.app_title = document.getElementById("app_title") as HTMLHeadingElement

    }
    async play() {
        this.init_interface()
        console.log(macro)
        console.log("i'm playing")
    }
    init_interface() {
        this.app_title.innerText = macro.titolo
    }
}

class C234 extends Course {
    constructor()
    {
        super()
    }
}

const course = new C234()
course.play()