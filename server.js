const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const neru = require('neru-alpha').neru
const OpenTok = require('opentok');




const state = neru.getInstanceState()
const app = express()

const apiKey = process.env.VIDEO_API_KEY;
const apiSecret = process.env.VIDEO_API_SECRET;
const opentok = new OpenTok(apiKey, apiSecret)




app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect('/app.html')
})


app.get('/session/:room',(req, res)=>{
  const { room: roomName } = req.params
  const getUrl = 'https://neru-68eeb4cf-video-server-live.euw1.runtime.vonage.cloud/session/' + roomName
  console.log("GETTING: ", 'https://neru-68eeb4cf-video-server-live.euw1.runtime.vonage.cloud/session/' + roomName)
  https.get(getUrl, (response) => {
    console.log('statusCode:', response.statusCode);
    console.log('headers:', response.headers);
    response.on('data', (d) => {
      res.json(d.toString())
    })
  }).on('error', (e) => {
    console.log(e)
    res.send(e)
  })
})


// Use /session/room to get apiKey, secret and token for access
/* app.get('/session/:room', async (req, res) => {
  try {
    const { room: roomName } = req.params;
    console.log("getting session ID from State Engine for Room: " + roomName)
    const  sessionId  = await state.hget('sessions', roomName)
    console.log(sessionId);
    if (sessionId !== null) {
      console.log(`Generating token for existing session: ${sessionId}`)
      const data = {
        sessionId: sessionId,
        apiKey: apiKey,
      }
      data.token = opentok.generateToken(sessionId);
      res.json(data);
    } else {
      const data = {
        apiKey: apiKey,
      }

      const sessionOptions = {
        mediaMode: "routed"
      }

      opentok.createSession(sessionOptions, (error, session)=>{
        if(error){
          console.log(error)
        } else {
          data.sessionId = session.sessionId
          data.token = opentok.generateToken(data.sessionId)
          res.json(data)
          console.log("setting session Id in state engine")
          let saveInfo = []
          saveInfo[roomName] = data.sessionId
          state.hset('sessions', saveInfo)
        }
      })
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }

}); */

app.get('/_/health', async (req, res) => {
  res.sendStatus(200);
});

const port = process.env.NERU_APP_PORT || process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Application Listing ON Port: ${port}`)
})
