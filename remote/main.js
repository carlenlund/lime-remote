const socket = io();

const isTouchDevice = 'ontouchstart' in window || navigator.msMaxTouchPoints;

const mouseDownEvent = isTouchDevice ? 'touchstart' : 'mousedown';
const mouseUpEvent = isTouchDevice ? 'touchend' : 'mouseup';

let connected = false;
let machineId = null;
let pointing = false;

let gyroscope = null;

let connectFormElement = document.querySelector('#connect-form');
connectFormElement.addEventListener('submit', e => {
  connectToMachine(machineIdInputElement.value);
  e.preventDefault();
  e.stopPropagation();
  return false;
});

let machineIdInputElement = document.querySelector('#machine-id-input');
let connectButtonElement =
    document.querySelector('#connect-button');

let connectionElement = document.querySelector('#connection');
connectionElement.style.display = 'none';
let machineIdElement = document.querySelector('#machine-id');
let disconnectButtonElement =
    document.querySelector('#disconnect-button');
disconnectButtonElement.addEventListener('click', () => {
  socket.emit('disconnectFromMachine');
  connectionElement.style.display = 'none';
  connectFormElement.style.display = 'block';
});

let pointButtonElement = document.querySelector('#point-button');
let buttonClickTime = 0;
let clickTime = 500;
pointButtonElement.addEventListener(mouseDownEvent, () => {
  pointing = true;
  socket.emit('startRemote');
  pointButtonElement.classList.add('point-button--active');
  buttonClickTime = Date.now();
});
pointButtonElement.addEventListener(mouseUpEvent, () => {
  pointing = false;
  socket.emit('stopRemote');
  pointButtonElement.classList.remove('point-button--active');
  if (Date.now() - buttonClickTime < clickTime) {
    socket.emit('clickRemote', 'left');
  }
});

let backButtonElement = document.querySelector('#back-button');
backButtonElement.addEventListener(mouseDownEvent, () => {
  socket.emit('clickButton', 'left');
  backButtonElement.classList.add('point-button--active');
});
backButtonElement.addEventListener(mouseUpEvent, () => {
  backButtonElement.classList.remove('point-button--active');
});

window.addEventListener('load', () => {
  initClient();
});

function initClient() {
  requestSensorPermissions();

  gyroscope = new GyroNorm();
  let args = {
    frequency: 60,
    orientationBase: GyroNorm.GAME,
    decimalCount: 2,
  };
  gyroscope.init(args).then(function() {
    gyroscope.start(handleGyroscope);
  }).catch(function(e){
    // TODO: Alert only when gyroscope is NOT supported.
    // alert('Device does not appear to support gyroscope. Make sure to visit the ' +
    //       'site on a smartphone.');
  });
}

async function requestSensorPermissions() {
  await Promise.all([
    navigator.permissions.query({name: 'accelerometer'}),
    navigator.permissions.query({name: 'magnetometer'}),
    navigator.permissions.query({name: 'gyroscope'})
  ])
    .then(results => {
      if (results.every(result => result.state === 'granted')) {
        console.log('Permission granted to use orientation sensors.');
      }
    });
}

function connectToMachine(id) {
  machineId = id;
  socket.emit('connectToMachine', id);
}

socket.on('connectedToMachine', () => {
  connected = true;
  machineIdElement.innerHTML =
      `Connected to <code class="code">${machineId}</code>`;
  connectFormElement.style.display = 'none';
  connectionElement.style.display = 'block';
});

socket.on('invalidMachineId', () => {
  alert(`Could not connect to "${machineId}"`);
});

socket.on('machineDisconnected', () => {
  disconnected();
});
socket.on('disconnect', () => {
  disconnected();
});

function disconnected() {
  if (!connected) {
    return;
  }
  connected = false;
  alert('Disconnected from machine');
  connectionElement.style.display = 'none';
  connectFormElement.style.display = 'block';
}

function handleGyroscope(event) {
  let x = -event.dm.gamma;
  let y = event.dm.alpha;
  if (pointing) {
    socket.emit('moveRemote', x, y);
  }
}
