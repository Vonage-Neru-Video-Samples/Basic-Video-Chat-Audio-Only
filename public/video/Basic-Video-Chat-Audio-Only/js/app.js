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
      initializeSession()
  }).catch(function catchErr(error) {
      console.log(error);
      console.log('Failed to get opentok sessionId and token. Make sure you have updated the config.js file.');
  })
}

let roomName = new URLSearchParams(window.location.search).get('roomName')

getSessionCredentials(roomName)



function handleError(error) {
  if (error) {
    console.error(error);
  }
}




function initializeSession() {
  const session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', (event) => {
    const subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    };
    session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
  });

  session.on('sessionDisconnected', (event) => {
    console.log('You were disconnected from the session.', event.reason);
  });
  
  session.on("streamDestroyed", (event)=>{
    if (event.reason === "clientDisconnected") {
    console.log("Call disconnected by the user");
    }  
  });

  session.on("connectionCreated", (event)=>{ console.log(event.type, event.connection.id)})
  session.on("connectionDestroyed", (event)=>{ console.log(event.type, event.connection.id)})
  
  let videoSource = null
  let audioSource = null
  let hasAudio = false
  let hasVideo = false

  // Connect to the session
  navigator.mediaDevices.getUserMedia({video: false, audio: true})
  .then(mediaStream=>{
    if(mediaStream.getAudioTracks().length > 0) {
      hasAudio = true
      audioSource = mediaStream.getAudioTracks()[0]
    }
  })
  .then(async ()=>{
    await navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then(mediaStream=>{
      let hasAudio = false
      let hasVideo = false
      if(mediaStream.getVideoTracks().length > 0) {
        hasVideo = true
        videoSource = mediaStream.getVideoTracks()[0]
        console.log(hasVideo, videoSource)
      }
      if(mediaStream.getAudioTracks().length > 0) {
        hasAudio = true
        audioSource = mediaStream.getAudioTracks()[0]
        console.log(hasAudio, audioSource)
      }
    })
    .catch((error)=>console.log(error, 'no video but audio OK'))
    
  })
  .catch((error)=>console.log(error, "No audio so cannot proceed!"))
  .finally(()=>{
    // initialize the publisher
    const publisherOptions = {
      "insertMode": "append",
      "width": "100%",
      "height": "100%",
      "name": "{\"role\":\"provider\",\"platform\":\"web\",\"designation_desc\":\"Provider\",\"role_id\":1,\"role_name\":\"Vyas, Dr. Meet\",\"joined_timestamp\":\"2024-05-08T12:42:39.894Z\"}",
      "videoSource": videoSource, //it will be null if no video source
      "publishVideo": videoSource ? true : false,
      "audioSource": audioSource, //it will be null if no video source
      "publishAudio": audioSource ? true : false,
      "capableSimulcastScreenshare": false
    }

    console.log(publisherOptions)

    const publisher = OT.initPublisher('publisher', publisherOptions, async (err) => {
      if (err) {
        console.error('Publisher creation error: ', err);
        reject(err)
      } else {
        //audioSource ? publisher.setAudioSource(this.audioSource) : ''
        //videoSource ? publisher.setVideoSource(videoSource) : ''
      }
    });
  
    session.connect(token, (error) => {
      if (error) {
        handleError(error)
      } else {
        // If the connection is successful, publish the publisher to the session
        session.publish(publisher, handleError)
      }
    })
  })
}


