const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const neru = require('neru-alpha').neru




const state = neru.getInstanceState()
const app = express()





app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect('/app.html')
})

// Use /session/room to get apiKey, secret and token for access
app.get('/session/:room', async (req, res) => {
  try {
    const { room: roomName } = req.params;
    console.log("getting session ID from State Engine for Room: " + roomName)
    const  sessionId  = await state.hget('sessions', roomName)
    console.log(sessionId);
    if (sessionId !== null) {
      console.log(sessionId)
      const data = opentok.generateToken(sessionId);
      res.json({
        sessionId: sessionId,
        token: data.token,
        apiKey: data.apiKey,
      });
    } else {
      const data = await opentok.getCredentials();
      console.log("setting session Id in state engine")
      let saveInfo = []
      saveInfo[roomName] = data.sessionId
      await state.hset('sessions', saveInfo)

      res.json({
        sessionId: data.sessionId,
        token: data.token,
        apiKey: data.apiKey,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }

});

app.get('/_/health', async (req, res) => {
  res.sendStatus(200);
});

const port = process.env.NERU_APP_PORT || process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Application Listing ON Port: ${port}`)
})
