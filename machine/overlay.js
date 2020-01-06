let position = {x: 0, y: 0};
let showPointer = false;
let pointerRadius = 250;

let canvas = document.querySelector('#overlay-canvas');
let screenSize = robot.getScreenSize();
canvas.width = screenSize.width;
canvas.height = screenSize.height;

let ctx = canvas.getContext('2d');

ipcRenderer.on('disconnectFromRemote', (e) => {
  showPointer = false;
});

ipcRenderer.on('startRemote', (e) => {
  let currentPosition = robot.getMousePos();
  position = {x: currentPosition.x, y: currentPosition.y};
});

ipcRenderer.on('moveRemote', (x, y, z) => {
  showPointer = true;
});

ipcRenderer.on('moveTo', (e, x, y, z) => {
  position = {x: x, y: y, z: z};
});

ipcRenderer.on('stopRemote', (e) => {
  showPointer = false;
});

update();

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (showPointer) {
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
