module.exports = function(redisClient) {
    var stats = {};
    var key_prefix = 'laravel:';
    var moment = require('moment');
    
    /**
     * builds counter json for a specific counter type for a given date range
     * with a resolution of interval eg get love between dates at a resolution
     * of minutes
     */
    stats.getByNamePeriod = function(counterName, fromDate, toDate, interval) 
    {
     console.log("\n got range range:");   
        var dataForRange = [];
        
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
console.log("\n range:" + value);
                dataForRange.push = parseInt(value);

            });
        });
        
        
        return dataForRange;
    };

    return stats;
};