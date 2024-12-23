import http from "http"

const server = http.createServer((req, res) => {
  if (req.method == "POST") {
    console.log('post')
    var data = ""
    req.on("data", (chunk) => data += chunk)
    .on("end", () => {
      if (!data) {
        res.end("No post data")
        return
      }
      console.log('send:', data)
      res.end()
    })
  } else if (req.method == "GET") {
    console.log('get')
    res.writeHead(200, { 'Content-Type': 'text/plain'})
    res.end("Discord Bot is active now\n");
  }
})

export default server