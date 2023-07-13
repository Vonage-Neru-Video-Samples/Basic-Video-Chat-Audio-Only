class Room {
    constructor(sessionUrl, getVideoToken, callback) {
        this.roomName = this.setRoomName()
        this.sessionUrl = sessionUrl
        this.sessionId = false
        this.apiKey = false
        this.token = false

        if(getVideoToken){
            this.getSessionCredentials(callback)
        } 
        

    }

    setRoomName(){
        const urlParams = new URLSearchParams(window.location.search)
        let name = urlParams.get("roomName")
        console.log(name)
        
        if(!name){
            name = this.generateRandomName()
            window.location.href = window.location.href + "?roomName=" + name
        }

        return name
    }

    generateRandomName(){
        return "default-" + Math.round(Math.random()*10000)
    }

    getSessionCredentials(callback){
        this.get(this.sessionUrl + this.roomName)
        .then(response=>{
            let credentials = JSON.parse(response)
            if(credentials.token){
                this.token = credentials.token
                this.apiKey = credentials.apiKey
                this.sessionId = credentials.sessionId
            }
            callback()
        })
    }
    
    get(url){
        return new Promise((resolve, reject)=>{
         const xhr = new XMLHttpRequest();
         xhr.open("GET", url);
         xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
         xhr.send(null);
         xhr.onreadystatechange = (e) => {
           if(e.currentTarget.readyState == 4){
             resolve(xhr.responseText);
           }
         }
         xhr.onerror = (e) => {
           reject(e);
         }
       })
    }
}