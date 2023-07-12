/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */


let apiKey;
let sessionId;
let token;
let room = window.localStorage.getItem("roomName") || "default"
let sessionUrl = window.location.href + "../../session/" + room

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
      session.publish(publisher, handleError);
    }
  });
}

// See the config.js file.
if (sessionUrl) {
  // Make a GET request to get the OpenTok API key, session ID, and token from the server
  fetch(sessionUrl)
  .then((response) => response.json())
  .then((json) => {
    apiKey = json.apiKey;
    sessionId = json.sessionId;
    token = json.token;
    // Initialize an OpenTok Session object
    initializeSession();
  }).catch((error) => {
    handleError(error);
    alert('Failed to get opentok sessionId and token. Make sure you have updated the config.js file.');
  });
}
