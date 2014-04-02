var twitter = require('twitter-text');


/* var result = twitter.autoLink(twitter.htmlEscape('#hello < @world >')); */

var result = twitter.autoLink("link @user, and expand url... http://t.co/0JG5Mcq", {
    urlEntities: [
        {
          "url": "http://t.co/0JG5Mcq",
          "display_url": "blog.twitter.com/2011/05/twitte…",
          "expanded_url": "http://blog.twitter.com/2011/05/twitter-for-mac-update.html",
          "indices": [
            30,
            48
          ]
        }
    ]});

console.log(result);
