var redis = require('node-redis'),
    moment = require('moment'),
    moment_range = require('moment-range');

// create redis client
var redisClient = redis.createClient(6379);
var stats = require('./libs/stats')(redisClient);

var startDate = moment();
var endDate = startDate.subtract(1, 'day');
console.log("\n startDate, endDate:", startDate.format(), endDate.format());  
var last_day_love = stats.getByNamePeriod('total', startDate, endDate, 'minute');

console.log("\n data:", last_day_love);  
