let apiKey
let sessionId
let token
let selectedStreamElementId

function getSessionCredentials(room){
  console.log("Getting Session and Token for room: ", room)
  fetch('https://neru-68eeb4cf-video-server-live.euw1.runtime.vonage.cloud/session/47807831/' + room).then(function fetch(res) {
      return res.json()
  }).then(function fetchJson(json) {
      // not required when using fetch.json() json = JSON.parse(json)
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

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

let roomName = new URLSearchParams(window.location.search).get('roomName')
getSessionCredentials(roomName)


function initializeSession() {

  // add button triggers
  
  // create session object
  const session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', (event) => {
    const subscriberOptions = {
      insertMode: 'append',
      width: '320px',
      height: '180px'
    };
    let subscriber = session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError)
    let newbutton = document.createElement("button")
    newbutton.innerHTML = "Select This Subscriber"
    newbutton.onclick = ()=>{
      toggleSelectedSubscriber(subscriber.element.id)
      console.log(subscriber.element.id)
    }
    subscriber.element.parentNode.appendChild(newbutton)
    
  });

  session.on('sessionDisconnected', (event) => {
    console.log('You were disconnected from the session.', event.reason);
  });
  
  session.on("streamDestroyed", (event)=>{

    if (event.reason === "clientDisconnected") {
    console.log("Call disconnected by the user");
    }
    
  });

  // initialize the publisher
  const publisherOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%',
    resolution: '1280x720'
  };
  const publisher = OT.initPublisher('publisher', publisherOptions, handleError);

  // Connect to the session
  session.connect(token, (error) => {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      session.publish(publisher, handleError)
      updateDebugInfo()
    }
  });
}


function toggleSelectedSubscriber(id){
  OT.subscribers.forEach(s=>{
    if(s.element.id==id){
      s.element.classList.add("objselected")
      selectedStreamElementId = s.element.id
      let subRect = s.element.getClientRects()[0]
      console.log(subRect)
      document.getElementById("debuginfo").style.top = `${subRect.top}px`
    } else {{
      s.element.classList.remove("objselected")
    }}
  })
}

function setSubscriberPreferredResolution(resolution){
  let subscriber = OT.subscribers.map(e=>e).find((s)=>{return s.element.id==selectedStreamElementId})
  subscriber.setPreferredResolution(resolution)
  console.log("setting preffered resolution for subscriber: ", subscriber.id)
  console.log("TO: ", resolution)
  console.log("For Stream ID: ", subscriber.stream.id)
}

function updateDebugInfo(){
  let subscriber = OT.subscribers.map(e=>e).find((s)=>{return s.element.id==selectedStreamElementId})
  let out
  let selected = false
  if(typeof(subscriber) === 'object'){
    selected = true
    out = `
      <button id="req180p" class="resbutton">Request 180p</button>
      <button id="req360p" class="resbutton">Request 360p</button>
      <button id="req720p" class="resbutton">Request 720p</button>
      <h3>Subscriber Debug Info</h3>
      <b>Connection Id:</b> ${subscriber.stream.connection.id} <br>
      <b>Stream Id:</b> ${subscriber.stream.id} <br>
      <b>id:</b> ${subscriber.id}<br>
      <br>
      <b>Width:</b> ${subscriber.videoWidth()} x 
      <b>Height: </b> ${subscriber.videoHeight()} <br> 
      <b>Frame Rate: ${subscriber.frameRate} <br>  `
      subscriber.getStats((error, stats)=>{
        subscriber.frameRate = stats.video.frameRate
      })
  } else {
    out = `
          <h3>Subscriber Debug Info</h3>
          No subscriber selected`
  }
  document.getElementById('debuginfo').innerHTML = out
  setTimeout(updateDebugInfo, 1000)

  if(selected){
    document.getElementById('req180p').onclick = (event)=>{setSubscriberPreferredResolution({width: 320, height: 180})}
    document.getElementById('req360p').onclick = (event)=>{setSubscriberPreferredResolution({width: 640, height: 360})}
    document.getElementById('req720p').onclick = (event)=>{setSubscriberPreferredResolution({width: 1280, height: 720})}

  }
}