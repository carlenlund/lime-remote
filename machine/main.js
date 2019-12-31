let logElement = document.querySelector('#log');

let hostElement = document.querySelector('#host');
hostElement.innerHTML = host.replace('http://', '').replace('https://', '');

let machineIdElement = document.querySelector('#machine-id');

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

ipcRenderer.on('startRemote', (e) => {
});

ipcRenderer.on('moveRemote', (e, x, y, z) => {
});

ipcRenderer.on('stopRemote', (e) => {
});

ipcRenderer.on('clickRemote', (e) => {
});

function log() {
  logElement.innerHTML += Array.from(arguments).join(' ') + '\n';
  console.log.apply(arguments, null);
}
