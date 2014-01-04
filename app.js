var app = require('http').createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    zmq = require("zmq");

app.listen(443);

var zmqSocket = zmq.socket('pull');
zmqSocket.connect('tcp://127.0.0.1:3000');

var sockets = new Array();

io.sockets.on('connection', function (socket) {
    // store socket for later use
    sockets.push(socket);

    socket.on('disconnect', function () {
        io.sockets.emit('user disconnected');
    });
});

zmqSocket.on('message', function(msg) {
    if (sockets.length !== 0) {
        for (i = 0; i < sockets.length; i++) {
            var sock = sockets[i];
            sock.volatile.emit('tweet', msg.toString());
        }
    }
});