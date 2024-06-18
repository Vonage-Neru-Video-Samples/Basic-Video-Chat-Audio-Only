let apiKey;
let sessionId;
let token;

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
      console.log("initialising session in 3 seconds")
      setTimeout(initializeSession, 3000)
  }).catch(function catchErr(error) {
      console.log(error);
      console.log('Failed to get opentok sessionId and token. Make sure you have updated the config.js file.');
  })
}

document.getElementById('button-start').addEventListener('click',(event)=>{

  let roomName = new URLSearchParams(window.location.search).get('roomName')
  console.log("page loaded.  Calling getSessionCredentials in 3 seconds")
  setTimeout(()=>{getSessionCredentials(roomName)},3000)

})




function handleError(error) {
  if (error) {
    console.error(error);
  }
}




function initializeSession() {
  const session = OT.initSession(apiKey, sessionId);
  console.log("session created in OT")
  // Subscribe to a newly created stream
  session.on('streamCreated', (event) => {
    const subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      subscribeToAudio: false,
      subscribeToVideo: false,
    };
    console.log("subscribing to: ", event.stream)
    console.log("with options: ", subscriberOptions)
    let s = session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError)
    setTimeout(()=>{
        console.log("subscribing to audio NOW:")
        s.subscribeToAudio(true)
    },10000)
    
    
  });

  session.on('sessionDisconnected', (event) => {
    console.log('You were disconnected from the session.', event.reason);
  });
  
  session.on("streamDestroyed", (event)=>{
    console.log("streamDestroyed", event.stream)
    if (event.reason === "clientDisconnected") {
    console.log("Call disconnected by the user");
    }  
  });

  session.on("connectionCreated", (event)=>{ console.log(event.type, event.connection.id)})
  session.on("connectionDestroyed", (event)=>{ console.log(event.type, event.connection.id)})
  
  // initialize the publisher
  const publisherOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%',
    publishAudio: false,
    publishVideo: false
  };
  const publisher = OT.initPublisher('publisher', publisherOptions, handleError);
  console.log("publisher created with options: ", publisherOptions)
  // Connect to the session
  session.connect(token, (error) => {
    if (error) {
      handleError(error);
    } else {
      console.log("connected to: ", session.id)
      // If the connection is successful, publish the publisher to the session
      session.publish(publisher, handleError);

      console.log("publishing... Waiting 10 seconds before enabling audio")
      setTimeout((session)=>{
        console.log("Enabling audio for publisher")
        publisher.publishAudio(true)
      },10000)
    }
  });
}


