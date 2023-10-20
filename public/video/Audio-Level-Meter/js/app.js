let apiKey;
let sessionId;
let token;
let subscribers;
let eventCount = 0;
let eventsPerSecond = 0;
let lastCountCheck = Date.now();
let audioLevelMax = 0
let audioLevelDecay = 0

function getSessionCredentials(room){
  fetch('../../session/' + room).then(function fetch(res) {
      return res.json()
  }).then(function fetchJson(json) {
      json = JSON.parse(json)
      console.log(json)
      apiKey = json.apiKey
      sessionId = json.sessionId
      token = json.token
      initializeSession()
      initialiseAudioLevelMeter()
  }).catch(function catchErr(error) {
      console.log(error);
      console.log('Failed to get opentok sessionId and token. Make sure you have updated the config.js file.');
  })
}

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

getSessionCredentials()


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

    subscriber.on("audioLevelUpdated",(event)=>{
      audioLevelUpdated(event)
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
  //const publisher = OT.initPublisher('publisher', publisherOptions, handleError);

  // Connect to the session
  session.connect(token, (error) => {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      //session.publish(publisher, handleError);
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