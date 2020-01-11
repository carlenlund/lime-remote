# Lime Remote

Gyroscopic mouse input for desktop using your smartphone.
A handy tool during presentations and in times where you can't reach your computer.

Lime Remote is inspired by Logitech's [Spotlight Presentation Remote](https://www.logitech.com/en-us/product/spotlight-presentation-remote).

![](Lime_Remote.gif)

## Download

[Windows 64-bit](https://github.com/carlenlund/lime-remote/releases/download/v0.1.1/limeremote-win32-x64-v0.1.1.zip)

[Windows 32-bit](https://github.com/carlenlund/lime-remote/releases/download/v0.1.1/limeremote-win32-ia32-v0.1.1.zip)

See build instructions below for usage on other platforms.

## Build

Install the Node modules with `npm install` followed by `npm run rebuild`.

Start the desktop client with `npm run machine`. The app will attempt to connect to the host specified in `config.json`.

Build an executable of the desktop client with `npm run build`.

Although an instance of the main web server is already running on Heroku, you can host your own instance with `npm run server`.
Note that using gyroscope sensors in the browser requires that SSL is enabled, so running the app on localhost requires a bit of tinkering.

## iOS gyroscope issues

["iPhone iOS 12.2 will disable gyroscope access by default."](https://discourse.threejs.org/t/iphone-ios-12-2-will-disable-gyroscope-access-by-default/6579)
Gyroscopic input can be enabled through Settings > Safari > Privacy & Security > Enable motion & orientation access.
