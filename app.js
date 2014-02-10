var app = require('http').createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    twitter = require('twitter-text'),
    zmq = require("zmq");

app.listen(443);

// sets the log level of socket.io, with
// log level 2 we wont see all the heartbits
// of each socket but only the handshakes and
// disconnections
io.set('log level', 2);

var zmqSocket = zmq.socket('pull');
zmqSocket.connect('tcp://127.0.0.1:3000');

io.sockets.on('connection', function (socket) {
    // default flow
    socket.set('feed-flow', true, function(){});
    
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
        
        socket.set('feed-flow', data.paused, function(){});
    });
});

var message_count = 0;
zmqSocket.on('message', function(msg)
{
    // autolink tweet usernames, urls and hashtags
    var tweet = JSON.parse(msg.toString());
    var tweetString = twitter.autoLink(tweet.text, {
        urlEntities: [tweet.urlEntities]
    });
    tweet.text = tweetString;
    tweet = JSON.stringify(tweet);

    for (var socketId in io.sockets.sockets)
    {
        var feed_paused = io.sockets.sockets[socketId].get('nickname', function (err, name) {
            console.log('Chat message by ', name);
        });
        console.log('feedpaused' + feed_paused);
        if (feed_paused === false) {
            continue;
        }
        io.sockets.sockets[socketId].volatile.emit('tweet', tweet);
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
}, 850);