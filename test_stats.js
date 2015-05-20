var redis = require('node-redis'),
    moment = require('moment'),
    moment_range = require('moment-range'),
    Q = require("q");

// create redis client
var redisClient = redis.createClient(6379);
var stats = require('./libs/stats')(redisClient);

var fromDate = moment().subtract(2, 'day');
var toDate = moment().subtract(1, 'day');
console.log("\n fromDate, toDate:", fromDate.format(), toDate.format());  
//var last_day_love = stats.getByNamePeriod('total', fromDate, toDate, 'minute');

/* Q.when(stats.getByNamePeriod('total', fromDate, toDate, 'minute'), function(data) {
    console.log("\n data:", data);
	var total = 0;
	for (var i = 0; i < data.length; i++) {
		total += data[i];
	}

	console.log('total', total);
}); */

Q.when(stats.getAll(fromDate, toDate, 'minute'), function(data) {
	console.log('data', data[1])

	for (var i = 0; i < data.length; i++) {
		console.log('ttl', data[i].length)
	}
});


//console.log("\n data:", last_day_love);  
