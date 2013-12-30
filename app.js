var app = require('http').createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    zmq = require("zmq");


app.listen(443);

/// zeromq php style logic
// $pull = $context->getSocket(ZMQ::SOCKET_PULL);
// $pull->bind('tcp://127.0.0.1:5555'); // Binding to 127.0.0.1 means the only client that can connect is itself
// $pull->on('message', array($pusher, 'onBlogEntry'));

zmqSocket = zmq.socket("sub");

//console.log(zmqSocket)
zmqSocket.connect('tcp://127.0.0.1:5555');



io.sockets.on('connection', function (socket) {
//  socket.emit('news', { hello: 'world' });

    socket.volatile.emit('news', {hello : 'some news that you may or may not get'});

    socket.on('my other event', function (data) {
      console.log(data);
    });
});

zmqSocket.on('message', function(data){
    socket.volatile.emit('stream', {data : data});
});
