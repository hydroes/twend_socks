var redis = require('node-redis'),
    moment = require('moment'),
    moment_range = require('moment-range');

// create redis client
var redisClient = redis.createClient(6379);
var stats = require('./libs/stats')(redisClient);

var fromDate = moment().subtract(2, 'day');
var toDate = moment().subtract(1, 'day');
console.log("\n fromDate, toDate:", fromDate.format(), toDate.format());  
var last_day_love = stats.getByNamePeriod('total', fromDate, toDate, 'minute');

console.log("\n data:", last_day_love);  
