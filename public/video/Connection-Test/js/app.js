let apiKey;
let sessionId;
let token;

let sessionConnectedDisplay = document.getElementById("sessionconnecteddisplay")
let publishingDisplay = document.getElementById("publishingdisplay")
let subscribingDisplay = document.getElementById("subscribingdisplay")

setBg(sessionConnectedDisplay, "red")
setBg(publishingDisplay, "red")
setBg(subscribingDisplay, "red")

let room = new RoomHarness("../../session/", true, ()=>{
  apiKey = room.apiKey
  sessionId = room.sessionId
  token = room.token
  initializeSession()
})


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

  // initialize the publisher
  const publisherOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%'
  };
  const publisher = OT.initPublisher('publisher', publisherOptions, handleError);

  // Connect to the session
  session.connect(token, (error) => {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      // session.publish(publisher, handleError);
    }
  });
}


function setBg(el, col){
  el.style.backgroundColor = col
}