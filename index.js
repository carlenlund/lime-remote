const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const featurePolicy = require('feature-policy');
const sslify = require('express-sslify');
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

app.use(sslify.HTTPS());

server.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

io.set('origins', '*:*');

io.on('connection', socket => {
  // Client

  socket.on('connectToServer', id => {
    connectToServer(socket, id);
  });

  socket.on('startRemote', () => {
    startRemote(socket);
  });

  socket.on('moveRemote', (x, y, z) => {
    moveRemote(socket, x, y, z);
  });

  socket.on('stopRemote', () => {
    stopRemote(socket);
  });

  socket.on('clickRemote', () => {
    clickRemote(socket);
  });

  // Server

  socket.on('createServer', () => {
    createServer(socket);
  });

  socket.on('disconnect', () => {
    disconnectServer(socket);
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

function startRemote(socket) {
  let server = getClientServer(socket);
  if (server) {
    server.socket.emit('startRemote');
  }
}

function moveRemote(socket, x, y, z) {
  let server = getClientServer(socket);
  if (server) {
    server.socket.emit('moveRemote', x, y, z);
  }
}

function stopRemote(socket) {
  let server = getClientServer(socket);
  if (server) {
    server.socket.emit('stopRemote');
  }
}

function clickRemote(socket) {
  let server = getClientServer(socket);
  if (server) {
    server.socket.emit('clickRemote');
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
