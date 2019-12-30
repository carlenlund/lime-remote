let logElement = document.querySelector('#log');

let serverButtonElement = document.querySelector('#server-button');
let serverIdElement = document.querySelector('#server-id');

ipcRenderer.on('serverCreated', (e, id) => {
  console.log(id);
  serverIdElement.innerHTML = id;
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
