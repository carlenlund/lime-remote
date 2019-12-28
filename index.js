const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const featurePolicy = require('feature-policy');
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(featurePolicy({
  features: {
    accelerometer: ["'*'"],
  },
}));

// https://stackoverflow.com/a/31144924
function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

app.use(requireHTTPS);

server.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

io.on('connection', socket => {
  console.log(`New connection: ${socket.id}`);
});
