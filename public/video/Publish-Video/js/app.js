/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

let apiKey;
let sessionId;
let token;

let room = new RoomHarness("../../session/", true, ()=>{
  apiKey = room.apiKey
  sessionId = room.sessionId
  token = room.token
  initializeSession()
})


const videoEl = document.querySelector('#video');

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

function initializeSession() {
  const stream = videoEl.captureStream();
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

  let publisher;
  function publish() {
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();

    // initialize the publisher
    const publisherOptions = {
      videoSource: videoTracks[0],
      audioSource: audioTracks[0],
      fitMode: 'contain',
      width: 320,
      height: 240
    };
    if (!publisher && videoTracks.length > 0 && audioTracks.length >= 0) {
      stream.removeEventListener('addtrack', publish);
      publisher = OT.initPublisher('publisher', publisherOptions, (err) => {
        if (err) {
          videoEl.pause();
          handleError(err)
        } else {
          videoEl.play();
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
      });
      publisher.on('destroyed', () => {
        videoEl.pause();
      });
    }
  }
  stream.addEventListener('addtrack', publish);
  publish();
}

