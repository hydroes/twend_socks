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

    socket.on('disconnect', function (socket) {
        console.log('disconected' + socket.id);
        io.sockets.emit('user disconnected');

    });

    socket.on('error', function (socket) {
        io.sockets.emit('an error occurred');
    });
});

zmqSocket.on('message', function(msg) {
    if (sockets.length !== 0) {
        for (i = 0; i < sockets.length; i++) {
            var sock = sockets[i];
            console.log(sock.connected)
//            sock.volatile.emit('tweet', msg.toString());
        }
    }
    console.log(sockets.length)
});