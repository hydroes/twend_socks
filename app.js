var app = require('http').createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    zmq = require("zmq");

app.listen(443);

//console.log(zmqSocket)
//var zmqSocket = zmq.socket('pull');
//zmqSocket.connect('tcp://127.0.0.1:3000');


io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});


//zmqSocket.on('message', function(msg) {
//    console.log('tweets bru!!');
//            sockets.emit('stream', {data : msg.toString()});

//        socket.volatile.emit('stream', {data : msg.toString()});

        // an event sent to all connected clients
//        io.sockets.emit(msg.toString());

//});


