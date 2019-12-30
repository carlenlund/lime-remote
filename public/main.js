const socket = io();

let debugElement = document.querySelector('#debug');
let logElement = document.querySelector('#log');

let connectedToServer = false;
let clientServerId = null;
let pointing = false;

let gyroscope = null;

let clientServerIdElement = document.querySelector('#client-server-id');
let clientConnectButtonElement =
    document.querySelector('#client-connect-button');
clientConnectButtonElement.addEventListener('click', () => {
  connectToServer(clientServerIdElement.value);
});

let clientPointButtonElement = document.querySelector('#client-point-button');
clientPointButtonElement.addEventListener('touchstart', () => {
  pointing = true;
  socket.emit('startRemote');
  clientPointButtonElement.classList.add('point-button--active');
});
clientPointButtonElement.addEventListener('touchend', () => {
  pointing = false;
  socket.emit('stopRemote');
  clientPointButtonElement.classList.remove('point-button--active');
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

async function requestSensorPermissions() {
  await Promise.all([
    navigator.permissions.query({name: 'accelerometer'}),
    navigator.permissions.query({name: 'magnetometer'}),
    navigator.permissions.query({name: 'gyroscope'})
  ])
    .then(results => {
      if (results.every(result => result.state === 'granted')) {
        log('Permission granted to use orientation sensors.');
      } else {
        log('Error: Cannot use orientation sensors.');
      }
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

function handleGyroscope(event) {
  let x = -event.dm.gamma;
  let y = event.dm.beta;
  let z = event.dm.alpha;
  debugElement.innerHTML = `x: ${x}\ny: ${y}\nz: ${z}`;
  if (pointing) {
    socket.emit('moveRemote', x, y, z);
  }
}

//
// Shared code
//

function log() {
  logElement.innerHTML += Array.from(arguments).join(' ') + '\n';
  console.log.apply(arguments, null);
}
