const config = require('../config.json');

const {app, BrowserWindow} = require('electron');
const path = require('path');
const robot = require('robotjs');
const io = require('socket.io-client');
const isDev = require('electron-is-dev');

const socket = io(config.host);

let mainWindow = null;
let overlayWindow = null;

let lastTime = 0;
let currentPosition = robot.getMousePos();
let position = {x: currentPosition.x, y: currentPosition.y};
let velocity = {x: 0, y: 0};
let pointerSpeed = {x: 15, y: 15};

app.on('ready', () => {
  createWindows();
});

function createWindows() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  if (!isDev) {
    mainWindow.removeMenu();
  }

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform === 'darwin') {
      mainWindow = null;
      overlayWindow.close();
      overlayWindow = null;
      return;
    }
    app.quit();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    initMachine();
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

  overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));

  mainWindow.focus();
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (!mainWindow) {
    createWindows();
  }
});

function initMachine() {
  socket.emit('createMachine');
  update();
}

socket.on('machineCreated', (id) => {
  console.log(id);
  mainWindow.webContents.send('machineCreated', id);
  overlayWindow.webContents.send('machineCreated', id);
});

socket.on('connectedToRemote', () => {
  mainWindow.webContents.send('connectedToRemote');
  overlayWindow.webContents.send('connectedToRemote');
});

socket.on('disconnectFromRemote', () => {
  mainWindow.webContents.send('disconnectFromRemote');
  overlayWindow.webContents.send('disconnectFromRemote');
});
socket.on('disconnect', () => {
  mainWindow.webContents.send('disconnectFromRemote');
  overlayWindow.webContents.send('disconnectFromRemote');
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
