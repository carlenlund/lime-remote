const socket = io();

const isTouchDevice = 'ontouchstart' in window || navigator.msMaxTouchPoints;

const mouseDownEvent = isTouchDevice ? 'touchstart' : 'mousedown';
const mouseUpEvent = isTouchDevice ? 'touchend' : 'mouseup';

let connectedToMachine = false;
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
    socket.emit('clickRemote');
  }
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
    let isAvailable = gyroscope.isAvailable();
    if (!isAvailable.deviceOrientationAvailable ||
        !isAvailable.rotationRateAvailable) {
      alert('Device does not support gyroscope. Make sure to visit the ' +
            'site on a smartphone.');
    }

    gyroscope.start(handleGyroscope);
  }).catch(function(e){
    alert(`Error: ${e}`);
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
  machineIdElement.innerHTML =
      `Connected to <code class="code">${machineId}</code>`;
  connectFormElement.style.display = 'none';
  connectionElement.style.display = 'block';
  machineIdInputElement.value = '';
});

socket.on('invalidMachineId', () => {
  alert(`Invalid machine ID "${machineId}"`);
});

socket.on('machineDisconnected', () => {
  disconnected();
});
socket.on('disconnect', () => {
  disconnected();
});

function disconnected() {
  alert('Disconnected from machine');
  connectionElement.style.display = 'none';
  connectFormElement.style.display = 'block';
}

function handleGyroscope(event) {
  let x = -event.dm.gamma;
  let y = event.dm.beta;
  let z = event.dm.alpha;
  if (pointing) {
    socket.emit('moveRemote', x, y, z);
  }
}
