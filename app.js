// redis lib: https://www.npmjs.org/package/node-redis
var app = require('http').createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    twitter = require('twitter-text'),
    redis = require('node-redis'),
    moment = require('moment'),
    moment_range = require('moment-range'),
    zmq = require('zmq')
    Q = require("q");

app.listen(443);

// create redis client
var redisClient = redis.createClient(6379);
var stats = require('./libs/stats')(redisClient);

// sets the log level of socket.io, with
// log level 2 we wont see all the heartbits
// of each socket but only the handshakes and
// disconnections
io.set('log level', 0);

// periodically get stats data
var statsCurrentData =
{
    minute: 0,
    hour: 0,
    day: 0
};

getCurrentStats();

io.sockets.on('connection', function (socket) {
    // default flow
    socket.set('feed_paused', false, function(){});
    
    socket.emit('init', {connected: true});
        
    


    var fromDate = moment().subtract(2, 'day');
    var toDate = moment().subtract(1, 'day');
    //console.log("\n fromDate, toDate:", fromDate.format(), toDate.format());
//var last_day_love = stats.getByNamePeriod('total', fromDate, toDate, 'minute');

    Q.when(stats.getByNamePeriod('total', fromDate, toDate, 'minute'), function(data) {
	socket.emit('stats-for-last', data);
    });

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
    
    socket.on('get-current-stats-data', function()
    {
        var jsonToSend = JSON.stringify(statsCurrentData);
        for (var socketId in io.sockets.sockets)
        {
            io.sockets.sockets[socketId].volatile.emit('statsCurrentData', jsonToSend);
        }
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

function getCurrentStats()
{
    redisClient.get('laravel:last_minute_total', function (error, value)
    {
        if (error !== null)
        {
            console.log("\nerror:" + error);
        }

        statsCurrentData.minute = parseInt(value, 10);

    });
    
    redisClient.get('laravel:last_hour_total', function (error, value)
    {
        if (error !== null)
        {
            console.log("\nerror:" + error);
        }

        statsCurrentData.hour = parseInt(value, 10);

    });
    
    redisClient.get('laravel:last_day_total', function (error, value)
    {
        if (error !== null)
        {
            console.log("\nerror:" + error);
        }

        statsCurrentData.day = parseInt(value, 10);

    });
}

var getStatisticsDataPeriodic = setInterval(function()
{
    getCurrentStats();

}, 20000);

