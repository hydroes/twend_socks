var app = require('http').createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    twitter = require('twitter-text'),
    redis = require('node-redis'),
    zmq = require('zmq');

app.listen(443);

// sets the log level of socket.io, with
// log level 2 we wont see all the heartbits
// of each socket but only the handshakes and
// disconnections
io.set('log level', 0);

io.sockets.on('connection', function (socket) {
    // default flow
    socket.set('feed_paused', false, function(){});

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('error', function () {
        console.log('an error occurred');
    });

    // pause feed for individual users
    socket.on('feed-flow', function (data) {
        console.log('feed-flow:triggered: ');
        console.log(data);

        socket.set('feed_paused', data.paused, function(){});
    });
});

var message_count = 0;

var zmqSocket = zmq.socket('sub');
zmqSocket.connect('tcp://127.0.0.1:3000');
zmqSocket.subscribe('microTweets');

// all parts of a message come as function arguments
zmqSocket.on('message', function(address, message)
{
    // all parts of a message come as function arguments
//    var args = Array.apply(null, arguments);
//    var address = args[0];
//    var message = args[1];

    // autolink tweet usernames, urls and hashtags
    var tweet = JSON.parse(message.toString());
    var tweetString = twitter.autoLink(tweet.text, {
        urlEntities: [tweet.urlEntities]
    });
    tweet.text = tweetString;
    tweet = JSON.stringify(tweet);

    for (var socketId in io.sockets.sockets)
    {
        var feed_paused = null;
        io.sockets.sockets[socketId].get('feed_paused', function (err, status) {
            feed_paused = status;
            if (err !== null) {
                console.log(err);
            }
        });

        if (feed_paused === true) {
            continue;
        }
        io.sockets.sockets[socketId].volatile.emit('tweet', tweet);
    }

    message_count++;
    // console.log(sockets.length)
});

// close socket on publisher termination
process.on('SIGINT', function() {
  zmqSocket.close()
  console.log('\nClosed')
});

// periodically send message count
var counterUpdate = setInterval(function() {
    for (var socketId in io.sockets.sockets)
    {
        io.sockets.sockets[socketId].volatile.emit('tweetCount', message_count);
    }
}, 850);