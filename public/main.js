const socket = io();

let connectedToServer = false;
let clientServerId = null;
let pointing = false;

let gyroscope = null;

let connectFormElement = document.querySelector('#connect-form');
connectFormElement.addEventListener('submit', e => {
  connectToServer(clientServerIdInputElement.value);
  e.preventDefault();
  e.stopPropagation();
  return false;
});

let clientServerIdInputElement = document.querySelector('#client-server-id-input');
let clientConnectButtonElement =
    document.querySelector('#client-connect-button');

let connectionElement = document.querySelector('#connection');
connectionElement.style.display = 'none';
let clientServerIdElement = document.querySelector('#client-server-id');
let clientDisconnectButtonElement =
    document.querySelector('#client-connect-button');
clientDisconnectButtonElement.addEventListener('click', () => {
  socket.emit('disconnectFromServer');
});

let clientPointButtonElement = document.querySelector('#client-point-button');
let buttonClickTime = 0;
let clickTime = 500;
clientPointButtonElement.addEventListener('touchstart', () => {
  pointing = true;
  socket.emit('startRemote');
  clientPointButtonElement.classList.add('point-button--active');
  buttonClickTime = Date.now();
});
clientPointButtonElement.addEventListener('touchend', () => {
  pointing = false;
  socket.emit('stopRemote');
  clientPointButtonElement.classList.remove('point-button--active');
  if (Date.now() - buttonClickTime < clickTime) {
    socket.emit('clickRemote');
  }
});

initClient();

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
      // alert('Device does not support gyroscope. Make sure to visit the ' +
      //       'site on a smartphone.');
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

function connectToServer(id) {
  clientServerId = id;
  socket.emit('connectToServer', id);
}

socket.on('connectedToServer', () => {
  clientServerIdElement.innerHTML =
      `Connected to <code class="code">${clientServerId}</code>`;
  connectFormElement.style.display = 'none';
  connectionElement.style.display = 'block';
  clientServerIdInputElement.value = '';
});

socket.on('invalidServerId', () => {
  alert(`Invalid server ID "${clientServerId}"`);
});

socket.on('serverDisconnected', () => {
  disconnected();
});
socket.on('disconnect', () => {
  disconnected();
});

function disconnected() {
  alert('Disconnected from server');
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
