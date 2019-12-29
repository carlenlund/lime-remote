const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const featurePolicy = require('feature-policy');
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;

let servers = {};

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(featurePolicy({
  features: {
    accelerometer: ["'*'"],
  },
}));

// https://stackoverflow.com/a/31144924
function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

app.use(requireHTTPS);

server.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

io.on('connection', socket => {
  // Client

  socket.on('connectToServer', id => {
    connectToServer(socket, id);
  });

  socket.on('moveRemote', (x, y, z) => {
    moveRemote(socket, x, y, z);
  });

  // Server

  socket.on('createServer', () => {
    createServer(socket);
  });

  socket.on('disconnect', () => {
    disconnectServer(socket);
  });

  socket.on('stop-remote', () => {
    stopRemote(socket);
  });
});

//
// Client code
//

function connectToServer(socket, serverId) {
  if (!(serverId in servers)) {
    socket.emit('invalidServerId');
    return;
  }

  let server = servers[serverId];
  server.clientSocket = socket;
  server.clientSocket.emit('connectedToServer');
  server.socket.emit('connectedToClient');
}

function moveRemote(socket, x, y, z) {
  let server = getClientServer(socket);
  if (server) {
    server.socket.emit('moveRemote', x, y, z);
  }
}

//
// Server code
//

function createServer(socket) {
  let serverId = getServerId(socket);
  servers[serverId] = {
    socket: socket,
    clientSocket: null,
  };
  socket.emit('serverCreated', serverId);
}

function disconnectServer(socket) {
  let serverId = getServerId(socket);
  if (!(serverId in servers)) {
    return;
  }
  let server = servers[serverId];
  if (server.clientSocket) {
    server.clientSocket.emit('serverDisconnected');
  }
  delete servers[serverId];
}

function stopRemote(socket) {
  let serverId = getServerId(socket);
  if (!(serverId in servers)) {
    return;
  }
  let server = servers[serverId];
  if (server.clientSocket) {
    server.clientSocket.emit('stopRemote');
  }
}

//
// Shared code
//

function getServerId(socket) {
  return socket.id.substr(0, 5);
}

function getClientServer(socket) {
  for (let serverId in servers) {
    let server = servers[serverId];
    if (server.clientSocket && server.clientSocket.id === socket.id) {
      return server;
    }
  }
  return null;
}
