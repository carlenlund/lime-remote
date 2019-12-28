const socket = io();

let debugElement = document.querySelector('#debug');
let logElement = document.querySelector('#log');

main();

function main() {
  if ('LinearAccelerationSensor' in window) {
    navigator.permissions.query({ name: 'accelerometer' }).then(result => {
      if (result.state != 'granted') {
        log('Sorry, we\'re not allowed to access sensors on your device..');
        return;
      }
      start();
    }).catch(err => {
      log('Integration with Permissions API is not enabled, still try to start');
      start();
    });
  } else {
    log('Your browser doesn\'t support sensors.');
  }
}

function start() {
  let options = {
    frequency: 60,
  };
  let sensor = null;
  try {
    sensor = new LinearAccelerationSensor(options);
  } catch (e) {
    log(e);
  }

  sensor.addEventListener('reading', e => {
    debugElement.innerHTML =
        `x: ${sensor.x}\ny: ${sensor.y}\nz: ${sensor.z}`;
  });

  sensor.addEventListener('error', e => {
    log(`Error: ${e.error.message}`);
  });

  sensor.start();
}

function log() {
  logElement.innerHTML += Array.from(arguments).join(' ') + '\n';
  console.log.apply(arguments, null);
}
