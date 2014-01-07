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
        console.log('user disconnected');

        // remove socket from array
        sockets.splice(sockets.indexOf(socket), 1);

    });

    socket.on('error', function () {
        console.log('an error occurred');
        // remove socket from array
        sockets.splice(sockets.indexOf(socket), 1);
    });
});

var message_count = 0;
zmqSocket.on('message', function(msg) {
    if (sockets.length !== 0) {
        for (i = 0; i < sockets.length; i++) {
            var sock = sockets[i];
            sock.volatile.emit('tweet', msg.toString());

            // send message count every X message
            if (message_count % 10 === 0) {
                sock.volatile.emit('tweetCount', message_count);
            }
        }
    }
    message_count++;
    // console.log(sockets.length)
});