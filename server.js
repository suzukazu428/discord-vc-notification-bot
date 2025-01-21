import express from "express"
const app = express()
const port = process.env.PORT || 3001

app.get('/', (req, res) => {
  res.send('I am alive')
})
const server = app.listen(port, () => {
  console.log('Server is running.')
})
function keepAlive() {
  server.keepAliveTimeout = 0
}

export default keepAlive