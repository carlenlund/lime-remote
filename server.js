const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const featurePolicy = require('feature-policy');
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;

let servers = {};

app.use(express.static(__dirname + '/remote'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(featurePolicy({
  features: {
    accelerometer: ["'*'"],
  },
}));

server.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

io.set('origins', '*:*');

io.on('connection', socket => {
  // Client

  socket.on('connectToServer', id => {
    if (!(serverId in servers)) {
      socket.emit('invalidServerId');
      return;
    }
    let server = servers[serverId];
    if (server.client) {
      socket.emit('invalidServerId');
      return;
    }
    server.clientSocket = socket;
    server.clientSocket.emit('connectedToServer');
    server.socket.emit('connectedToClient');
  });

  socket.on('disconnectFromServer', id => {
    if (!(serverId in servers)) {
      return;
    }
    let server = servers[serverId];
    server.clientSocket = null;
    server.socket.emit('disconnectFromClient');
  });

  socket.on('startRemote', () => {
    let server = getClientServer(socket);
    if (server) {
      server.socket.emit('startRemote');
    }
  });

  socket.on('moveRemote', (x, y, z) => {
    let server = getClientServer(socket);
    if (server) {
      server.socket.emit('moveRemote', x, y, z);
    }
  });

  socket.on('stopRemote', () => {
    let server = getClientServer(socket);
    if (server) {
      server.socket.emit('stopRemote');
    }
  });

  socket.on('clickRemote', () => {
    let server = getClientServer(socket);
    if (server) {
      server.socket.emit('clickRemote');
    }
  });

  // Server

  socket.on('createServer', () => {
    let serverId = getServerId(socket);
    servers[serverId] = {
      socket: socket,
      clientSocket: null,
    };
    socket.emit('serverCreated', serverId);
  });

  socket.on('disconnect', () => {
    let serverId = getServerId(socket);
    if (!(serverId in servers)) {
      return;
    }
    let server = servers[serverId];
    if (server.clientSocket) {
      server.clientSocket.emit('serverDisconnected');
    }
    delete servers[serverId];
  });
});

function getServerId(socket) {
  return socket.id.substr(0, 5).replace('-', '0').replace('_', '1');
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
