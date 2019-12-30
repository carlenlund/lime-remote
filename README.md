# Lime Remote

Gyroscopic mouse input for desktops using a smartphone. The app works for most modern desktops and smartphones.

The project is inspired by Logitech's [Spotlight Presentation Remote](https://www.logitech.com/en-us/product/spotlight-presentation-remote).

## Development

Install the Node modules with `npm install` followed by `npm run rebuild`.

`npm run server` starts the main server. There is currently an instance of the server running at [limeremote.herokuapp.com](http://limeremote.herokuapp.com/).

`npm run machine` start the desktop client on the current machine.

`npm run build` builds an executable of the desktop for the current machine.

## iOS gyroscope issues

["iPhone iOS 12.2 will disable gyroscope access by default."](https://discourse.threejs.org/t/iphone-ios-12-2-will-disable-gyroscope-access-by-default/6579)
Gyroscopic input can be enabled through Settings > Safari > Privacy & Security > Enable motion & orientation access.
