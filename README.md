# Lime Remote

Gyroscopic mouse input for desktops using a smartphone. Lime Remote works on most modern desktops and smartphones.

The project is inspired by Logitech's [Spotlight Presentation Remote](https://www.logitech.com/en-us/product/spotlight-presentation-remote).

## Download

[Windows 64-bit]()

[Windows 32-bit]()

See build instructions below for usage on other platforms.

<!--
## System overview

The app consists of three parts: desktop client, remote client and main server.

The desktop client runs on your computer and controls the mouse and keyboard using input sent from the remote.
Using an ID given in the desktop client, you connect your remote to the computer through a smarthphone web browser.
When connected, the remote is able to send gyroscopic data and button input to the desktop.

The desktop client runs as an [Electron](https://electronjs.org/) app.
Backend code for both desktop and server is written in JavaScript using [Node.js](https://nodejs.org/en/).
For internal communication the app uses WebSockets to send data between the server and clients.
-->

## Build

Install the Node modules with `npm install` followed by `npm run rebuild`.

`npm run server` starts the main server.

`npm run machine` start the desktop client on the current machine.

`npm run build` builds an executable of the desktop client for the current machine.

## iOS gyroscope issues

["iPhone iOS 12.2 will disable gyroscope access by default."](https://discourse.threejs.org/t/iphone-ios-12-2-will-disable-gyroscope-access-by-default/6579)
Gyroscopic input can be enabled through Settings > Safari > Privacy & Security > Enable motion & orientation access.
