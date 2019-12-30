const {app, BrowserWindow} = require('electron');
const path = require('path');
const robot = require('robotjs');
const io = require('socket.io-client');

const socket = io('https://limeremote.herokuapp.com');

let mainWindow = null;
let overlayWindow = null;

let lastTime = 0;
let currentPosition = robot.getMousePos();
let position = {x: currentPosition.x, y: currentPosition.y};
let velocity = {x: 0, y: 0};
let pointerSpeed = {x: 12, y: 13};

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
    overlayWindow = null;
    app.quit();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    initServer();
  });

  overlayWindow = new BrowserWindow({
    frame: false,
    transparent: true,
    resizable: false,
    fullscreen: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  overlayWindow.setIgnoreMouseEvents(true);
  overlayWindow.setAlwaysOnTop(true, 'screen');

  overlayWindow.loadFile('overlay.html');

  overlayWindow.on('closed', () => {
    mainWindow = null;
    overlayWindow = null;
    app.quit();
  });
});

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + 
  if (process.platform === 'darwin') {
    return;
  }
  app.quit();
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

function initServer() {
  socket.emit('createServer');
  update();
}

socket.on('serverCreated', (id) => {
  mainWindow.webContents.send('serverCreated', id);
  console.log(id);
});

socket.on('connectedToClient', () => {
  mainWindow.webContents.send('connectedToClient');
});

socket.on('startRemote', () => {
  let currentPosition = robot.getMousePos();
  position = {x: currentPosition.x, y: currentPosition.y};
  mainWindow.webContents.send('startRemote');
  overlayWindow.webContents.send('startRemote');
});

socket.on('moveRemote', (x, y, z) => {
  velocity = {x: x * pointerSpeed.x, y: -z * pointerSpeed.y};
  mainWindow.webContents.send('moveRemote', x, y, z);
  overlayWindow.webContents.send('moveRemote', x, y, z);
});

socket.on('stopRemote', () => {
  velocity = {x: 0, y: 0};
  mainWindow.webContents.send('stopRemote');
  overlayWindow.webContents.send('stopRemote');
});

socket.on('clickRemote', () => {
  robot.mouseClick('left');
  mainWindow.webContents.send('clickRemote');
  overlayWindow.webContents.send('clickRemote');
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

  if (velocity.x || velocity.y) {
    robot.setMouseDelay(2);
    robot.moveMouse(position.x, position.y);
  }

  setTimeout(update, 1000 / 60);
}
