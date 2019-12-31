const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const featurePolicy = require('feature-policy');
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;

let connections = {};

app.use(express.static(__dirname + '/remote'));
app.use(bodyParser.urlencoded({extended: true}));
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
  // Remote

  socket.on('connectToMachine', machineId => {
    if (!(machineId in connections)) {
      socket.emit('invalidMachineId');
      return;
    }
    let connection = connections[machineId];
    if (connection.remoteSocket) {
      socket.emit('invalidMachineId');
      return;
    }
    connection.remoteSocket = socket;
    connection.remoteSocket.emit('connectedToMachine');
    connection.machineSocket.emit('connectedToRemote');
  });

  socket.on('disconnectFromMachine', () => {
    let connection = getRemoteMachine(socket);
    if (!connection) {
      return;
    }
    connection.remoteSocket = null;
    connection.machineSocket.emit('disconnectFromRemote');
  });

  socket.on('disconnect', () => {
    let connection = getRemoteMachine(socket);
    if (!connection) {
      return;
    }
    connection.remoteSocket = null;
    connection.machineSocket.emit('disconnectFromRemote');
  });

  socket.on('startRemote', () => {
    let connection = getRemoteMachine(socket);
    if (connection) {
      connection.machineSocket.emit('startRemote');
    }
  });

  socket.on('moveRemote', (x, y, z) => {
    let connection = getRemoteMachine(socket);
    if (connection) {
      connection.machineSocket.emit('moveRemote', x, y, z);
    }
  });

  socket.on('stopRemote', () => {
    let connection = getRemoteMachine(socket);
    if (connection) {
      connection.machineSocket.emit('stopRemote');
    }
  });

  socket.on('clickRemote', () => {
    let connection = getRemoteMachine(socket);
    if (connection) {
      connection.machineSocket.emit('clickRemote');
    }
  });

  // Machine

  socket.on('createMachine', () => {
    let machineId = getMachineId(socket);
    let connection = {
      machineSocket: socket,
      remoteSocket: null,
    };
    connections[machineId] = connection;
    connection.machineSocket.emit('machineCreated', machineId);
  });

  socket.on('disconnect', () => {
    let machineId = getMachineId(socket);
    if (!(machineId in connections)) {
      return;
    }
    let connection = connections[machineId];
    if (connection.remoteSocket) {
      connection.remoteSocket.emit('machineDisconnected');
    }
    delete connections[machineId];
  });
});

function getMachineId(socket) {
  return socket.id.substr(0, 5).replace('-', '0').replace('_', '1');
}

function getRemoteMachine(socket) {
  for (let machineId in connections) {
    let connection = connections[machineId];
    if (connection.remoteSocket && connection.remoteSocket.id === socket.id) {
      return connection;
    }
  }
  return null;
}
