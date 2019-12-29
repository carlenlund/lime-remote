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

let gyroscope = null;

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
  socket.emit('stopRemote');
});

function initClient() {
  gyroscope = new GyroNorm();
  let args = {
    frequency: 60,
    orientationBase: GyroNorm.GAME,
    decimalCount: 2,
  };
  gyroscope.init(args).then(function() {
    let isAvailable = gyroscope.isAvailable();
    if (!isAvailable.deviceOrientationAvailable) {
      log('Device orientation is not available.');
    }
    if (!isAvailable.rotationRateAvailable) {
      log('Device rotation rate is not available.');
    }

    gyroscope.start(handleGyroscope);
  }).catch(function(e){
    log(`Error: ${e}`);
  });
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

function handleGyroscope(sensor) {
  let x = sensor.dm.alpha;
  let y = sensor.dm.beta;
  let z = sensor.dm.gamma;
  debugElement.innerHTML = `x: ${x}\ny: ${y}\nz: ${z}`;
  if (pointing) {
    socket.emit('moveRemote', x, y, z);
  }
}

//
// Server code
//

let lastTime = 0;
let stopTime = 0;
let stopDelay = 150;
let position = {x: 0, y: 0};
let velocity = {x: 0, y: 0};
let acceleration = {x: 0, y: 0};
let pointerSpeed = 50;

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
  acceleration = {x: x * pointerSpeed, y: -z * pointerSpeed};
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

  if (Date.now() - stopTime < stopDelay) {
    velocity = {x: 0, y: 0};
    acceleration = {x: 0, y: 0};
  }

  position.x += velocity.x * deltaTime;
  position.y += velocity.y * deltaTime;
  velocity.x += acceleration.x * deltaTime;
  velocity.y += acceleration.y * deltaTime;

  position.x = Math.max(0, Math.min(serverCanvas.width, position.x));
  position.y = Math.max(0, Math.min(serverCanvas.height, position.y));

  let ctx = serverCanvas.getContext('2d');
  ctx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(position.x, position.y, 20, 0, 2 * Math.PI);
  ctx.closePath();
}

//
// Shared code
//

function log() {
  logElement.innerHTML += Array.from(arguments).join(' ') + '\n';
  console.log.apply(arguments, null);
}
