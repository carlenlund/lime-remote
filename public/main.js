const socket = io();

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
    log("Linear acceleration along the X-axis " + sensor.x);
    log("Linear acceleration along the Y-axis " + sensor.y);
    log("Linear acceleration along the Z-axis " + sensor.z);
  });

  sensor.addEventListener('error', e => {
    sensor.errorType = `Error: ${e.error.name}`;
    sensor.errorMessage = `Error message: ${e.error.message}`;
    log(sensor.errorType);
    log(sensor.errorMessage);
  });

  sensor.start();
}

function log() {
  document.querySelector('#log').innerHTML += Array.from(arguments).join(' ') + '<br>';
  console.log.apply(arguments, null);
}
