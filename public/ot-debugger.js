class OTDebugger {
    constructor () {
        this.consolelogging = true
        this.log("Debugger Started")
    }





    log() {
        for(let i = 0; i < arguments.length; i++){
            this.logSingle(arguments[i])
        }
    }
    logSingle(l){
        if(this.consolelogging) console.log(l)
        let out
        if(typeof(l) === 'object'){
            out = JSON.stringify(l)
        } else {
            out = l
        }
    
        let entry = document.createElement('div')
        entry.class = "logentry"
        let t = new Date()
        let time = t.toLocaleDateString() + " " + t.toLocaleTimeString() + "." + t.getMilliseconds()
        entry.innerHTML = time + " - " + out
    
        document.getElementById('otdblogs').firstElementChild.prepend(entry)
    }    
}

let OTDB = new OTDebugger()