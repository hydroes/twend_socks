
var moment = require('moment'),
    moment_range = require('moment-range'),
    Q = require("q");

module.exports = function(redisClient) {
    var stats = {};
    var keys = ['love', 'hate'];
    var key_prefix = 'laravel:';
    
    /**
     * builds counter json for a specific counter type for a given date range
     * with a resolution of interval eg get love between dates at a resolution
     * of minutes
     */
    stats.getByNamePeriod = function(counterName, fromDate, toDate, interval) 
    {
        var dataForRange = [];
        var deferred = Q.defer();
        
        // create a date range eg
        var range = moment().range(fromDate, toDate);
        
        // iterate thru range by interval, interval can be days minutes etc
        range.by(interval, function(moment) {
            // build key with `moment`
            var key = key_prefix + moment.format('DD_MM_YYYY_HH_mm') + '_' + counterName;

            redisClient.get(key, function(error, value) {
                if (error !== null)
                {
                    console.log("\n stats error:" + error);
                }

                dataForRange.push({
                  'time': moment.unix(),
                  'value': parseInt(value)
                });
                
                if (moment.format() === toDate.format()) {
                    var data = {
                        counterName: counterName,
                        data: dataForRange
                    }
                    deferred.resolve(data); 
                }

            });
        });
        
        
        return deferred.promise;
    };

    stats.getAll = function(fromDate, toDate, interval) {
        var deferred = Q.defer();
        // go thru range then keywords add keyword total to range key
        // data will look like so: [[timestanmp, keyval1, keyval2]]
        var keywords = ['love', 'hate', 'think', 'believe', 'want', 'total'];
        var stat_promises = [];

        for (var i = 0; i < keywords.length; i++) {
            stat_promises.push(stats.getByNamePeriod(keywords[i], fromDate, toDate, interval));
        }

        Q.all(stat_promises).then(function(stats) {
            deferred.resolve(stats); 
        });

        return deferred.promise;
    }

    return stats;
};

