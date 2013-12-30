var app = require('http').createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    zmq = require("zmq");


app.listen(443);


io.sockets.on('connection', function (socket) {
//  socket.emit('news', { hello: 'world' });


  socket.volatile.emit('news', {hello : 'some news that you may or may not get'});


  socket.on('my other event', function (data) {
    console.log(data);
  });
});
