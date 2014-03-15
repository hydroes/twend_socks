var zmq = require('zmq')
var subscriber = zmq.socket('sub')

subscriber.on("message", function(reply) {
//var msg = reply.toString('hex');
//console.log(reply)

    // all parts of a message come as function arguments
    var args = Array.apply(null, arguments);
//    console.log(args);
    
    for (var i =0; i < args.length; i++) {
        console.log(args[i].toString())
    }

//console.log(reply.toString());
//console.log(reply.toJSON())
//  console.log('Received message: ', reply);
})

subscriber.connect("tcp://localhost:6000")
subscriber.subscribe("B")

process.on('SIGINT', function() {
  subscriber.close()
  console.log('\nClosed')
})

