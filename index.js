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

server.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

io.on('connection', socket => {
  console.log(`New connection: ${socket.id}`);
});
