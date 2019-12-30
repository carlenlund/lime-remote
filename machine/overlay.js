let lastTime = 0;
let currentPosition = robot.getMousePos();
let position = {x: currentPosition.x, y: currentPosition.y};
let velocity = {x: 0, y: 0};
let pointerSpeed = {x: 15, y: 15};
let showPointer = false;
let pointerRadius = 250;

let canvas = document.querySelector('#overlay-canvas');
let screenSize = robot.getScreenSize();
canvas.width = screenSize.width;
canvas.height = screenSize.height;

ipcRenderer.on('connectedToRemote', (e) => {
});

ipcRenderer.on('disconnectFromRemote', (e) => {
  showPointer = false;
});

ipcRenderer.on('startRemote', (e) => {
  let currentPosition = robot.getMousePos();
  position = {x: currentPosition.x, y: currentPosition.y};
});

ipcRenderer.on('moveRemote', (e, x, y, z) => {
  velocity = {x: x * pointerSpeed.x, y: -z * pointerSpeed.y};
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

  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (showPointer) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.beginPath();
    ctx.arc(position.x, position.y, pointerRadius, 0, 2 * Math.PI);
    ctx.clip();
    ctx.clearRect(position.x - pointerRadius, position.y - pointerRadius,
                  2 * pointerRadius, 2 * pointerRadius);
    ctx.restore();
  }

  setTimeout(update, 1000 / 30);
}
