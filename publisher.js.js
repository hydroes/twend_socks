var zmq = require('zmq')
  , sock = zmq.socket('push');

sock.bindSync('tcp://127.0.0.1:3000');
console.log('Producer bound to port 3000');

var count = 0;

setInterval(function(){
  console.log('sending work ' + count);
  sock.send('some work ' + count);
  count++;

}, 500);
