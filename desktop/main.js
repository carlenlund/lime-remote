let debugElement = document.querySelector('#debug');
let logElement = document.querySelector('#log');

let lastTime = 0;
let currentPosition = robot.getMousePos();
let position = {x: currentPosition.x, y: currentPosition.y};
let velocity = {x: 0, y: 0};
let pointerSpeed = {x: 12, y: 13};
let showPointer = false;

let serverButtonElement = document.querySelector('#server-button');
let serverIdElement = document.querySelector('#server-id');

ipcRenderer.on('serverCreated', (e, id) => {
  console.log(id);
  serverIdElement.innerHTML = id;
});

ipcRenderer.on('connectedToClient', (e) => {
  log('Connected to client');
});

ipcRenderer.on('startRemote', (e) => {
  let currentPosition = robot.getMousePos();
  position = {x: currentPosition.x, y: currentPosition.y};
});

ipcRenderer.on('moveRemote', (e, x, y, z) => {
  velocity = {x: x * pointerSpeed.x, y: -z * pointerSpeed.y};
  debugElement.innerHTML = `x: ${x}\ny: ${y}\nz: ${z}`;
  showPointer = true;
});

ipcRenderer.on('stopRemote', (e) => {
  velocity = {x: 0, y: 0};
  showPointer = false;
});

ipcRenderer.on('clickRemote', (e) => {
});

update();

function update() {
  let time = Date.now();
  let deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  position.x += velocity.x * deltaTime;
  position.y += velocity.y * deltaTime;

  let screenSize = robot.getScreenSize();
  let screenWidth = screenSize.width;
  let screenHeight = screenSize.height;
  position.x = Math.max(0, Math.min(screenWidth, position.x));
  position.y = Math.max(0, Math.min(screenHeight, position.y));

  setTimeout(update, 1000 / 60);
}

//
// Shared code
//

function log() {
  logElement.innerHTML += Array.from(arguments).join(' ') + '\n';
  console.log.apply(arguments, null);
}
