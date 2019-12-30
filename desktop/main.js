const socket = io('https://limeremote.herokuapp.com');

let debugElement = document.querySelector('#debug');
let logElement = document.querySelector('#log');

let lastTime = 0;
let stopTime = 0;
let position = {x: 0, y: 0};
let velocity = {x: 0, y: 0};
let pointerSpeed = {x: 9, y: 10};
let showPointer = false;

let serverButtonElement = document.querySelector('#server-button');
let serverIdElement = document.querySelector('#server-id');

let serverCanvas = document.querySelector('#server-canvas');
serverCanvas.width = 600;
serverCanvas.height = 400;

initServer();

function initServer() {
  socket.emit('createServer');
  update();
}

socket.on('serverCreated', (id) => {
  serverIdElement.innerHTML = id;
});

socket.on('connectedToClient', () => {
  log('Connected to client');
});

socket.on('startRemote', () => {
  position = {x: serverCanvas.width / 2, y: serverCanvas.height / 2};
  showPointer = true;
});

socket.on('moveRemote', (x, y, z) => {
  velocity = {x: x * pointerSpeed.x, y: -z * pointerSpeed.y};
  debugElement.innerHTML = `x: ${x}\ny: ${y}\nz: ${z}`;
  showPointer = true;
});

socket.on('stopRemote', () => {
  velocity = {x: 0, y: 0};
  showPointer = false;
  stopTime = Date.now();
});

function update() {
  requestAnimationFrame(update);

  let time = Date.now();
  let deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  position.x += velocity.x * deltaTime;
  position.y += velocity.y * deltaTime;

  position.x = Math.max(0, Math.min(serverCanvas.width, position.x));
  position.y = Math.max(0, Math.min(serverCanvas.height, position.y));

  let ctx = serverCanvas.getContext('2d');
  ctx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
  if (showPointer) {
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(position.x, position.y, 20, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }
}

//
// Shared code
//

function log() {
  logElement.innerHTML += Array.from(arguments).join(' ') + '\n';
  console.log.apply(arguments, null);
}
