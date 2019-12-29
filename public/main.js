const socket = io();

let debugElement = document.querySelector('#debug');
let logElement = document.querySelector('#log');

let startElement = document.querySelector('#start');

let clientButtonElement = document.querySelector('#client-button');
clientButtonElement.addEventListener('click', function() {
  initClient();
  startElement.style.display = 'none';
  clientElement.style.display = 'block';
});
let clientElement = document.querySelector('#client');
clientElement.style.display = 'none';
let clientServerIdElement = document.querySelector('#client-server-id');
let clientConnectButtonElement =
    document.querySelector('#client-connect-button');
clientConnectButtonElement.addEventListener('click', function() {
  connectToServer(clientServerIdElement.value);
});

let serverButtonElement = document.querySelector('#server-button');
let serverIdElement = document.querySelector('#server-id');
serverButtonElement.addEventListener('click', function() {
  initServer();
  startElement.style.display = 'none';
  serverElement.style.display = 'block';
});
let serverElement = document.querySelector('#server');
serverElement.style.display = 'none';

//
// Client code
//

let connectedToServer = false;
let clientServerId = null;

function initClient() {
  if ('LinearAccelerationSensor' in window) {
    navigator.permissions.query({name: 'accelerometer'}).then(result => {
      if (result.state != 'granted') {
        log('Sorry, we\'re not allowed to access sensors on your device..');
        return;
      }
      startClient();
    }).catch(err => {
      log('Integration with Permissions API is not enabled, still try to start');
      startClient();
    });
  } else {
    log('Your browser doesn\'t support sensors.');
  }
}

function startClient() {
  let options = {
    frequency: 60,
  };
  let sensor = null;
  try {
    sensor = new LinearAccelerationSensor(options);
  } catch (e) {
    log(e);
  }

  sensor.addEventListener('reading', e => {
    debugElement.innerHTML =
        `x: ${sensor.x}\ny: ${sensor.y}\nz: ${sensor.z}`;

    socket.emit('moveRemote', sensor.x, sensor.y, sensor.z);
  });

  sensor.addEventListener('error', e => {
    log(`Error: ${e.error.message}`);
  });

  sensor.start();
}

function connectToServer(id) {
  clientServerId = id;
  socket.emit('connectToServer', id);
}

socket.on('connectedToServer', () => {
  clientServerIdElement.innerHTML = clientServerId;
  log('Connected to server');
});

socket.on('invalidServerId', () => {
  log('Invalid server id');
});

socket.on('serverDisconnected', () => {
  log('Disconnected from server');
});

//
// Server code
//

function initServer() {
  socket.emit('createServer');
}

socket.on('serverCreated', (id) => {
  serverIdElement.innerHTML = `Server id: ${id}`;
});

socket.on('connectedToClient', () => {
  log('Connected to client');
});

socket.on('moveRemote', (x, y, z) => {
  let scale = 1000;
  x = Math.round(x * scale);
  y = Math.round(y * scale);
  z = Math.round(z * scale);
  debugElement.innerHTML = `x: ${x}\ny: ${y}\nz: ${z}`;
});

//
// Shared code
//

function log() {
  logElement.innerHTML += Array.from(arguments).join(' ') + '\n';
  console.log.apply(arguments, null);
}
