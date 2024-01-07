const net = require("net");
const crypto = require('crypto')

const WEBSOCKET_MAGIC_STRING_KEY = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'


const server = net.createServer(socket => {
    console.log("Client connected!")
    socket.on('data', (data) => {
      console.log(data.toString())
      if(giveValue(data, 'Connection: ') == 'Upgrade'){
        onSocketUpgrade(data, socket);
      }
      else{
        console.error("not websocket request")
      }
    });
})

function giveValue(data, keyWord) {
  const connectionIndex = (data.toString()).indexOf(keyWord);
if (connectionIndex !== -1) {
  const substringAfterConnection = (data.toString()).substring(connectionIndex + keyWord.length);
  const endOfLineIndex = substringAfterConnection.indexOf('\r');
  const connectionValue = endOfLineIndex !== -1 ? substringAfterConnection.substring(0, endOfLineIndex).trim() : '';
  return connectionValue
} else {
  console.log('Connection header not found');
}
}

function onSocketUpgrade(data, socket) {
      const webClientSocketKey  = giveValue(data, 'Sec-WebSocket-Key: ')
      console.log(`${webClientSocketKey} connected!`)
      const head = prepareHandShakeHeaders(webClientSocketKey)
  socket.write(head)
}

function prepareHandShakeHeaders(id) {
  const acceptKey = createSocketAccept(id)
  const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptKey} `,
      ''
  ].map(line => line.concat('\r\n')).join('')
  return headers
}

function createSocketAccept(id) {
  const shalgo = crypto.createHash('sha1')
  shalgo.update(id + WEBSOCKET_MAGIC_STRING_KEY)
  return shalgo.digest('base64')
}

//error handling to keep the server on
;
[
  "unhandledRejection",
  "uncaughtException"
].forEach((event) => {
  process.on(event, err => {
      console.error(`something bad happened! event: ${event} msg: ${err.stack || err}`)
  })
});

server.listen(8000, () => console.log("server on port 8000") );