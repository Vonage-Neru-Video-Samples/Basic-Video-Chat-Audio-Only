let apiKey;
let sessionId;
let token;
let session;
let publisher;
let subscriber;
let mst;

function getSessionCredentials(room){
  const urlParams = new URL(window.location.toLocaleString()).searchParams;
  let roomName = urlParams.get('roomName');
  console.log(roomName)
  if(roomName == null || roomName.length < 3)
      window.location.href = "./app.html?roomName=default-1234"
            
  fetch('../../session/' + roomName)
  .then(function fetch(res) {
      return res.json()
  })
  .then(function fetchJson(json) {
      console.log(json)
      //json = JSON.parse(json)
      apiKey = json.apiKey
      sessionId = json.sessionId
      token = json.token
      //initializeSession()
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

function initSession(){
  initializeSession()
}

function publishScreen(){

  session.publish(publisher)
  
}

getSessionCredentials()

function initializeSession() {
  session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', (event) => {
    const subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    };
    subscriber = session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
  });

  session.on('sessionDisconnected', (event) => {
    console.log('You were disconnected from the session.', event.reason);
  });

  const publisherOptions = {
    insertMode: 'append',
    videoSource: "screen",
    width: '100%',
    height: '100%'
  }
  publisher = OT.initPublisher('publisher', publisherOptions, handleError)
  session.publish(publisher)
  
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


