var Twitter = require('twitter');
var key = require('./keys.js');
var Tweet = require('./tweets/model.js').model;
var help  = require('./tweets/helpers.js');
var searches = require('./searches/controller.js');

var monthAgo = new Date();
var month = monthAgo.getMonth();
monthAgo.setMonth(month - 1);
monthAgo = monthAgo.toString().slice(4, 15);

monthAgo = help.convertDateToInteger(monthAgo);

var storeTweet = function(tweet){
  Tweet.create(tweet);
};

function releaseTheKraken(){
  var client = new Twitter({
    consumer_key: key.twitterConsumer,
    consumer_secret: key.twitterConsumerSecret,
    access_token_key: key.twitterAccessToken,
    access_token_secret: key.twitterAccessTokenSecret
  });
  
  client.stream('user', {'with':'followings'}, function(stream) {
    stream.on('data', function(tweet) {
      if (!('friends' in tweet)){
        var created_at = tweet.created_at.slice(4, 10) + tweet.created_at.slice(25);
        var tweet_id = tweet.id_str;
        var newTweet = {
          tweet_id: tweet_id,
          tweet_id_str: tweet.id_str,
          created_at: created_at,
          url: help.extractUrl(tweet.text),
          retweet_count: tweet.retweet_count,
          tweeted_by: tweet.user['screen_name'],
          profile_img: tweet.user.profile_image_url_https,
          background_img: tweet.user.profile_background_image_url_https,
          text: tweet.text
        }
        storeTweet(newTweet);
        searches.addTweet(newTweet, tweet.text);
      }
    });

    stream.on('error', function(error) {
      console.log(error);
      throw error;
    });
  });
}

module.exports = releaseTheKraken;
