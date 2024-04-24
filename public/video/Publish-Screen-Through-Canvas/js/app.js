import {VideoController} from "./modules/video.js"


class App {
    constructor(){
        this.captureModeFixedResolution = true
        this.canvas = document.getElementById("capturecanvas")
        this.roomName = new URLSearchParams(window.location.search).get('roomName')
        this.videoController = new VideoController()
        this.videoController.connect(this.roomName)
        .then((session)=>{
            //this.captureScreenToCanvas()
        })

        document.getElementById("capturebutton").onclick = ()=>{
            this.captureScreenToCanvas()
        }
    }

    captureScreenToCanvas(){
        navigator.mediaDevices.getDisplayMedia()
        .then(ms=>{
            console.log(ms)
            this.mediaStream = ms
            this.videoElement = document.createElement("video")
            this.videoElement.srcObject = ms
            this.videoElement.play()
            //document.body.appendChild(this.videoElement)
            if(this.captureModeFixedResolution){
                this.captureFrameNew()
            } else {
                this.captureFrame()
            }

            
            this.videoController.publishCanvas(this.canvas)
        })
    }

    captureFrame(){
        this.canvas.width = this.videoElement.videoWidth
        this.canvas.height = this.videoElement.videoHeight
        let ctx = this.canvas.getContext("2d")
        ctx.drawImage(this.videoElement, 0,0, this.videoElement.videoWidth, this.videoElement.videoHeight)
        setTimeout(()=>{this.captureFrame();}, 1000/30)
    }

    captureFrameNew(){
        this.canvas.width = 1280
        this.canvas.height = 720
        let ctx = this.canvas.getContext("2d")
        ctx.drawImage(this.videoElement, 0,0,1280, 720)
        setTimeout(()=>{this.captureFrame();}, 1000/1)
    }

}


const app = new App()
window.app = app
