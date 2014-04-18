// redis lib: https://www.npmjs.org/package/node-redis
var app = require('http').createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    twitter = require('twitter-text'),
    redis = require('node-redis'),
    zmq = require('zmq');

app.listen(443);

// create redis client
var redisClient = redis.createClient(6379);

// sets the log level of socket.io, with
// log level 2 we wont see all the heartbits
// of each socket but only the handshakes and
// disconnections
io.set('log level', 0);

io.sockets.on('connection', function (socket) {
    // default flow
    socket.set('feed_paused', false, function(){});

    socket.on('disconnect', function(){});

    socket.on('error', function ()
    {
        console.log('an error occurred');
    });

    // pause feed for individual users
    socket.on('feed-flow', function (data)
    {
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
    // var args = Array.apply(null, arguments);
    // var address = args[0];
    // var message = args[1];

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
        io.sockets.sockets[socketId].get('feed_paused', function (err, status)
        {
            feed_paused = status;
            if (err !== null) {
                console.log(err);
            }
        });

        if (feed_paused === true)
        {
            continue;
        }
        io.sockets.sockets[socketId].volatile.emit('tweet', tweet);
    }

    message_count++;
    // console.log(sockets.length)
});

// close socket on publisher termination
process.on('SIGINT', function()
{
  zmqSocket.close();
  console.log('\nClosed');
});

// periodically send message count
var counterUpdate = setInterval(function()
{
    for (var socketId in io.sockets.sockets)
    {
        io.sockets.sockets[socketId].volatile.emit('tweetCount', message_count);
    }
}, 1000);

// periodically get stats data
var statsCurrentData =
{
    minute: 0,
    hour: 0,
    day: 0
};

var getStatisticsDataPeriodic = setInterval(function()
{
    var periods = 
    {
        minute: 1,
        hour: 60,
        day: 1440
    };
    
    for (period in periods)
    {
        var literal = new String(period);
        redisClient.get('laravel:last_'+literal+'_total', function (error, value)
        {
            console.log('f da')
            console.log( parseInt(value, 10))
            if (error !== null)
            {
                console.log("\nerror:" + error);
            }

            statsCurrentData[period] = parseInt(value, 10);

        });
    }

}, 20000);


var sendStatisticsData = setInterval(function()
{
    var jsonToSend = JSON.stringify(statsCurrentData);
    for (var socketId in io.sockets.sockets)
    {
        io.sockets.sockets[socketId].volatile.emit('statsCurrentData', jsonToSend);
    }
}, 60000);