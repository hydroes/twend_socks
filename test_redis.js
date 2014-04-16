var redis = require('node-redis')

var client = redis.createClient(6379);

client.get('laravel:last_minute_aggregated', function (error, buffer)
{
    console.log("error:\n" + error);

    console.log("\n buffer: \n" + buffer);
});

client.end();