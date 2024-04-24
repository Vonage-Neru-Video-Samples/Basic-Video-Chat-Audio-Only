
let mediaStream

let apiKey
let sessionId
let token
let subscribers
let eventCount = 0
let eventsPerSecond = 0
let lastCountCheck = Date.now()
let audioLevelMax = 0
let audioLevelDecay = 0
let mediaStreamId = false

function getSessionCredentials(room){
  console.log("Getting Session and Token for room: ", room)
  fetch('https://neru-68eeb4cf-video-server-live.euw1.runtime.vonage.cloud/session/47807831/' + room).then(function fetch(res) {
      return res.json()
  }).then(function fetchJson(json) {
      //json = JSON.parse(json)
      console.log(json)
      apiKey = json.apiKey
      sessionId = json.sessionId
      token = json.token
      initializeSession()
  }).catch(function catchErr(error) {
      console.log(error);
      console.log('Failed to get opentok sessionId and token. Make sure you have updated the config.js file.');
  })
}

let roomName = new URLSearchParams(window.location.search).get('roomName')
console.log(roomName)

getSessionCredentials(roomName)

function handleError(error) {
  if (error) {
    console.error(error);
  }
}


function initializeSession() {
  subscribers = new Array()
  const session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', (event) => {
    const subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    };
    let subscriber = session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError)
    
    subscriber.meterSetup = false
    
    
    //console.log(subscriber.element)

    subscriber.on("audioLevelUpdated",(event)=>{
      if(event.audioLevel || subscriber.meterSetup){
        if(subscriber.meterSetup){          
          audioLevelUpdated(event)
          subscriber.osc.draw()
        } else {
          // setup meter
          subscriber.meterSetup = true
          let srcStream = event.target.element.childNodes[0].childNodes[2].srcObject
          let canvas = document.createElement("canvas")
          canvas.classList.add("oscoverlay")
          canvas.id = subscriber.id + "osc"
          subscriber.element.appendChild(canvas)
          //document.getElementById("oscilliscope").appendChild(canvas)
          subscriber.osc = new oscilloscope(canvas, srcStream)
          event.target.element.childNodes[0].childNodes[2].onplay = ()=>{
            if(subscriber.osc.source != subscriber.element.childNodes[0].childNodes[2].srcObject){
              subscriber.osc.connect(subscriber.element.childNodes[0].childNodes[2].srcObject)
            }
          }
        }
      }


    })

  });

  session.on('sessionDisconnected', (event) => {
    console.log('You were disconnected from the session.', event.reason);
  });
  
  session.on("streamDestroyed", (event)=>{
    if (event.reason === "clientDisconnected") {
    console.log("Call disconnected by the user")
    }
    
  });

  // initialize the publisher
  const publisherOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%'
  };
  const publisher = OT.initPublisher('publisher', publisherOptions, handleError);
  publisher.publishAudio(true)
  publisher.publishVideo(true)

  // Connect to the session
  session.connect(token, (error) => {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      session.publish(publisher, handleError);
    }
  });
}



function initialiseAudioLevelMeter(){
  let volumeSlider = document.getElementById("volume")
  let volumeDecimal = document.getElementById("volumedecimal")
  let levelMeter = document.getElementById("levelmeter")
  let levelDecimal = document.getElementById("leveldecimal")
  let currentVolume = volumeSlider.value

  document.getElementById("version").innerHTML = OT.version

  volumeSlider.onchange = ()=>{
    let newVolume = volumeSlider.value
    let subscribers = OT.subscribers.map(e=>e)
    subscribers.forEach(subscriber=>{
      console.log(newVolume)
      subscriber.setAudioVolume(newVolume * 1)
    })
    volumeDecimal.innerHTML = newVolume
  }
}

function audioLevelUpdated(event){
  
  let volumeSlider = document.getElementById("volume")
  let volumeDecimal = document.getElementById("volumedecimal")
  let levelMeter = document.getElementById("levelmeter")
  let maxLevelMeter = document.getElementById("maxlevelmeter")
  let decayingLevelMeter = document.getElementById("decayinglevelmeter")
  let levelDecimal = document.getElementById("leveldecimal")
  let currentVolume = volumeSlider.value
  let moreInfo = document.getElementById("moreinfo")

  let level = event.audioLevel
  
  eventCount++
  if(Date.now() - lastCountCheck > 1000){
    eventsPerSecond = eventCount
    eventCount = 0
    lastCountCheck = Date.now()
    audioLevelMax = 0
  }

  if(level > audioLevelMax) audioLevelMax = level

  if(level > audioLevelDecay) {
    audioLevelDecay = level
  } else {
    audioLevelDecay -= audioLevelDecay/100
  }

  levelDecimal.innerHTML = level
  levelMeter.style.width = level * 1000 + "px"
  levelMeter.style.height = "20px"

  maxLevelMeter.style.width = audioLevelMax * 1000 + "px"
  maxLevelMeter.style.height = "20px"

  decayingLevelMeter.style.width = audioLevelDecay * 1000 + "px"
  decayingLevelMeter.style.height = "20px"

  moreInfo.innerHTML = `
    Events Per Second: ${eventsPerSecond} (${eventCount})<br>
  `
}


class oscilloscope {
  constructor(canvas, srcStream){
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    this.analyser = this.audioCtx.createAnalyser()
    this.analyser.fftSize = 2048
    this.bufferLength = this.analyser.frequencyBinCount
    this.dataArray = new Uint8Array(this.bufferLength)
    this.analyser.getByteTimeDomainData(this.dataArray)
    this.canvas = canvas
    this.canvasCtx = this.canvas.getContext("2d")
    this.source = this.audioCtx.createMediaStreamSource(srcStream)
    this.source.connect(this.analyser)
    console.log(`mediaStream Created: ${srcStream.id}`)
    this.draw()
  }

// draw an oscilloscope of the current audio source
  connect(mediaStream){
    this.source.disconnect(this.analyser)
    this.source = this.audioCtx.createMediaStreamSource(mediaStream)
    this.source.connect(this.analyser)
    console.log(`mediaStream Updated to: ${mediaStream.id}`)
  }

  draw() {
    
    this.analyser.getByteTimeDomainData(this.dataArray);

    this.canvasCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.strokeStyle = "rgb(0, 255, 0)";

    this.canvasCtx.beginPath();

    const sliceWidth = (this.canvas.width * 1.0) / this.bufferLength;
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      if(this.dataArray[i]==null || this.dataArray[i]==0.0)
        this.canvasCtx.strokeStyle = "rgb(255, 0, 0)"
      else
        this.canvasCtx.strokeStyle = "rgb(0, 255, 0)"


      const v = this.dataArray[i] / 128.0;
      const y = (v * this.canvas.height) / 2;

      if (i === 0) {
        this.canvasCtx.moveTo(x, y);
      } else {
        this.canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
    this.canvasCtx.stroke();
  }

}