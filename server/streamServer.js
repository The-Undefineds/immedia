/*
    file: streamServer.js
    - - - - - - - - - - - - - - 
    Creates a persistent HTTP connection to
    Twitter's Streaming API. It leverages a
    3rd-party package and its associated
    documentation, https://www.npmjs.com/package/twitter.
 */

// Required node modules
var Twitter = require('twitter');

// immedia dependencies
var key = require('./keys.js');                     // API keys file with five different Twitter API keys/secrets
var Tweet = require('./tweets/model.js').model;     // Mongoose model for Tweets stored in MongoDB
var searches = require('./searches/controller.js'); // Mongoose controller for Searches indexed in MongoDB
var utils = require('./utils.js');         // Helper functions

var monthAgo = new Date();
var month = monthAgo.getMonth();
monthAgo.setMonth(month - 1);
monthAgo = monthAgo.toString().slice(4, 15);

monthAgo = utils.convertDateToInteger(monthAgo);

var storeTweet = function(tweet){
  Tweet.create(tweet);
};

/*
    Creates a Twitter Streaming API connection using an
    external OAuth library, https://www.npmjs.com/package/twitter.
 */
function createStreamingConnection(){
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
          url: utils.extractUrl(tweet.text),
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

module.exports = createStreamingConnection;
