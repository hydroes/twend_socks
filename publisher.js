var zmq = require('zmq')
var publisher = zmq.socket('pub')

publisher.bind('tcp://*:8688', function(err) {
  if(err)
    console.log(err)
  else
    console.log("Listening on 8688...")
})


    setInterval(function() {
        console.log('sent');
        publisher.send("Hello there!")
    }, 1000)

process.on('SIGINT', function() {
  publisher.close()
  console.log('\nClosed')
})

