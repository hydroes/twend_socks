var app = require('http').createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    zmq = require("zmq");

app.listen(443);

var zmqSocket = zmq.socket('pull');
zmqSocket.connect('tcp://127.0.0.1:3000');

var sockets = new Array();

//io.sockets.on('connection', function (socket) {

//  socket.on('tweets', function (socket)
//  {
//      var tweets = setInterval(function () {
//        getTweets(socket);
//      }, 100);
//
//      socket.on('disconnect', function () {
//        clearInterval(tweets);
//      });

//  });
//});

function getTweets(socket) {
    zmqSocket.on('message', function(msg) {
        console.log(msg.toString());
        socket.volatile.emit('tweet', msg.toString());
    });
}

//zmqSocket.on('message', function(msg) {
//    console.log('tweets bru!!');
//            sockets.emit('stream', {data : msg.toString()});

//        socket.volatile.emit('stream', {data : msg.toString()});

        // an event sent to all connected clients
//        if (io.sockets !== undefined) {
//            io.sockets.emit(msg.toString());
//        }
//
//});

// possible flow

io.sockets.on('connection', function (socket) {
    sockets.push(socket);
});

zmqSocket.on('message', function(msg) {
    if (sockets.length !== 0) {
        for (i = 0; i < sockets.length; i++) {
            var sock = sockets[i];
            sock.volatile.emit('tweet', msg.toString());
        }
    }
});