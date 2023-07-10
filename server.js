const express = require('express')
const app = express()
const port = 3000


app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Express and Node are working Fine')
})

app.listen(port, () => {
  console.log(`Application Listing ON Port: ${port}`)
})
