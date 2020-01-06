let logElement = document.querySelector('#log');

let hostElement = document.querySelector('#host');
hostElement.innerHTML = host.replace('http://', '').replace('https://', '');

let machineIdElement = document.querySelector('#machine-id');

ipcRenderer.on('badVersion', (version, serverVersion) => {
  log('You\'re using an outdated version of Lime Remote<br>' +
      '<a href="https://github.com/carlenlund/lime-remote" target="_blank">' +
      'Download latest version here</a><br><br>');
});

ipcRenderer.on('machineCreated', (e, id) => {
  console.log(id);
  machineIdElement.innerHTML = id;
});

ipcRenderer.on('connectedToRemote', (e) => {
  log('Connected to remote');
});

ipcRenderer.on('disconnectFromRemote', (e) => {
  log('Disconnected from remote');
});

function log() {
  logElement.innerHTML += Array.from(arguments).join(' ') + '\n';
  console.log.apply(arguments, null);
}
