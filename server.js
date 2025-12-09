import express from "express"
const app = express()
const port = process.env.PORT || 3001

app.get('/', (req, res) => {
  const data = {
      "message": "I am alive.",
      port
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(data);
})

const connect = async () => {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}.`)
  })
  server.keepAliveTimeout = 0
}

export default connect