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
        for (i = 0; i < sockets.length; i++)
        {
            sockets[i].volatile.emit('tweet', msg.toString());
        }
    }
    message_count++;
    // console.log(sockets.length)
});

// periodically send message count
var counterUpdate = setInterval(function() {
    for (i = 0; i < sockets.length; i++)
    {
        if (sockets.length !== 0) {
            sockets[i].volatile.emit('tweetCount', message_count);
        }
    }
}, 3000);