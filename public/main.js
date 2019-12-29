const socket = io();

let debugElement = document.querySelector('#debug');
let logElement = document.querySelector('#log');

let startElement = document.querySelector('#start');

let clientElement = document.querySelector('#client');
clientElement.style.display = 'none';
let serverElement = document.querySelector('#server');
serverElement.style.display = 'none';

//
// Client code
//

let connectedToServer = false;
let clientServerId = null;
let pointing = false;

let clientButtonElement = document.querySelector('#client-button');
clientButtonElement.addEventListener('click', () => {
  initClient();
  startElement.style.display = 'none';
  clientElement.style.display = 'block';
});
let clientServerIdElement = document.querySelector('#client-server-id');
let clientConnectButtonElement =
    document.querySelector('#client-connect-button');
clientConnectButtonElement.addEventListener('click', () => {
  connectToServer(clientServerIdElement.value);
});

let clientPointButtonElement = document.querySelector('#client-point-button');
clientPointButtonElement.addEventListener('touchstart', () => {
  pointing = true;
});
clientPointButtonElement.addEventListener('touchend', () => {
  pointing = false;
  socket.emit('stop-remote');
});

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
    if (pointing) {
      debugElement.innerHTML = `x: ${sensor.x}\ny: ${sensor.y}\nz: ${sensor.z}`;
      socket.emit('moveRemote', sensor.x, sensor.y, sensor.z);
    }
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

var lastTime = 0;
var stopTime = 0;
var stopDelay = 150;
var position = {x: 0, y: 0};
var velocity = {x: 0, y: 0};
var acceleration = {x: 0, y: 0};

let serverButtonElement = document.querySelector('#server-button');
serverButtonElement.addEventListener('click', () => {
  initServer();
  startElement.style.display = 'none';
  serverElement.style.display = 'block';
});
let serverIdElement = document.querySelector('#server-id');

let serverCanvas = document.querySelector('#server-canvas');
serverCanvas.width = 600;
serverCanvas.height = 400;
position = {x: serverCanvas.width / 2, y: serverCanvas.height / 2};

function initServer() {
  socket.emit('createServer');
  update();
}

socket.on('serverCreated', (id) => {
  serverIdElement.innerHTML = `Server id: ${id}`;
});

socket.on('connectedToClient', () => {
  log('Connected to client');
});

socket.on('moveRemote', (x, y, z) => {
  if (Date.now() - stopTime < stopDelay) {
    velocity = {x: 0, y: 0};
    acceleration = {x: 0, y: 0};
    return;
  }
  let scale = 5;
  acceleration = {x: x * scale, y: -z * scale};
  debugElement.innerHTML = `x: ${x}\ny: ${y}\nz: ${z}`;
});

socket.on('stopRemote', () => {
  velocity = {x: 0, y: 0};
  acceleration = {x: 0, y: 0};
  stopTime = Date.now();
});

function update() {
  requestAnimationFrame(update);

  let time = Date.now();
  let deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  position.x += velocity.x * deltaTime;
  position.y += velocity.y * deltaTime;
  velocity.x += acceleration.x * deltaTime;
  velocity.y += acceleration.y * deltaTime;

  position.x = Math.max(0, Math.min(serverCanvas.width, position.x));
  position.y = Math.max(0, Math.min(serverCanvas.height, position.y));

  let ctx = serverCanvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(position.x, position.y, 2, 0, 2 * Math.PI);
  ctx.closePath();
}

//
// Shared code
//

function log() {
  logElement.innerHTML += Array.from(arguments).join(' ') + '\n';
  console.log.apply(arguments, null);
}
