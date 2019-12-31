const config = require('../config.json');

const robot = require('robotjs');
const {ipcRenderer} = require('electron');

window.host = config.host;

window.robot = robot;
window.ipcRenderer = ipcRenderer;
