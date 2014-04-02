var app = require('http').createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    redis = require('node-redis'),
    zmq = require("zmq");

app.listen(443);

var zmqSocket = zmq.socket('pull');
zmqSocket.connect('tcp://127.0.0.1:3000');

io.sockets.on('connection', function (socket) {

    // to store custom data
    // socket.set('nickname', 'Guest');

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('error', function () {
        console.log('an error occurred');
    });
});

var message_count = 0;
zmqSocket.on('message', function(msg)
{
    for (var socketId in io.sockets.sockets)
    {
        io.sockets.sockets[socketId].volatile.emit('tweet', msg.toString());

        // to get custom data:
        /*io.sockets.sockets[socketId].get('nickname', function(err, nickname) {
            console.log(nickname);
        });*/
    }

    message_count++;
    // console.log(sockets.length)
});

// periodically send message count
var counterUpdate = setInterval(function() {
    for (var socketId in io.sockets.sockets)
    {
        io.sockets.sockets[socketId].volatile.emit('tweetCount', message_count);
    }
}, 650);