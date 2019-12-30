let logElement = document.querySelector('#log');

let serverButtonElement = document.querySelector('#server-button');
let serverIdElement = document.querySelector('#server-id');

ipcRenderer.on('serverCreated', (e, id) => {
  console.log(id);
  serverIdElement.innerHTML = id;
});

ipcRenderer.on('connectedToClient', (e) => {
  log('Connected to client');
});

ipcRenderer.on('disconnectFromClient', (e) => {
  log('Disconnected from client');
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
