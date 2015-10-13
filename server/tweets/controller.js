var Tweet = require('./model.js');
var OAuth = require('../Oauth.js');
var help  = require('./helpers.js');
var searches = require('../searches/controller.js');


var Q = require('q'),
    request = require('request');

var newsOrgs = require('../assets/assets.js').newsOrgs;

var apiUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json';

// These four lines create a string that holds a month ago's date from the present date, in order 
// to later compare with tweet dates, and through this, set an age limit to the retrieval of tweets from twitter's API
var monthAgo = new Date();
var month = monthAgo.getMonth();
monthAgo.setMonth(month - 1);
monthAgo = monthAgo.toString().slice(4, 15);

monthAgo = help.convertDateToInteger(monthAgo);

module.exports = function(){
  lastTweetStored(newsOrgs[0]);
};

// Finds the id of the tweet stored in our database associated with the given 'screenName' 
// that is the greatest (most recent), then calls 'requestNewTweets', which makes use of this value
var lastTweetStored = function(screenName){
  var findTweets = Q.nbind(Tweet.find, Tweet);
  findTweets({
        tweeted_by: screenName
      })
        .then(function(tweets) {
          // If no tweets are found, then set our result to 0
          var lastTweetID = tweets.length > 0 ? tweets.sort(function(b, a){
            return b.tweet_id - a.tweet_id;
          })[tweets.length-1].tweet_id : 0;
          requestNewTweets(screenName, lastTweetID);
        });
};

// Retrieves all the tweets for the organization that (A) have not been retrieved, or (B) are from within the past month
var requestNewTweets = function(screenName, sinceID, maxID){
  // If the argument 'maxID' is not defined, as it isn't the first time the function is called, we set the retrieval
  // to only ask for the very latest tweets. If 'maxID' is defined, as it is when the function is called recursively below,
  // we set the retrieval to get all the tweets that have id's lower than it (tweets created before it). The recursion will end
  // once either (A) we reach an ID lower than 'sinceID', defined by the function above, or (B) 'created_at' becomes more than a month from the present.
  var authorization = !maxID ? OAuth(apiUrl, 'screen_name=' + screenName, 'count=200&include_rts=false') : OAuth(apiUrl, 'screen_name=' + screenName, 'count=200&include_rts=false&max_id=' + maxID);
  var search = {
    url: apiUrl,
    qs: {
      screen_name: screenName,
      include_rts: 'false',
      count: '200'
    },
    headers: {
      Authorization: authorization
    }
  }
  if (maxID) {
    search.qs.max_id = maxID;
  }
  request(search, function(error, response, body){
    if (error) {
      console.log('error: ', error);
    } else {
      body = JSON.parse(body);
      if (!("errors" in body)) {
        for (var i = 0; i < body.length; i++) {
          var tweet = body[i];
          var created_at = tweet.created_at.slice(4, 10) + tweet.created_at.slice(25);
          var tweet_id = tweet.id;
          if (tweet_id < sinceID || help.convertDateToInteger(created_at) < monthAgo) {         // Ends recursion
            updateNextNewsOrg(screenName);
            return; 
          }
          var newTweet = {
            tweet_id: tweet_id,
            tweet_id_str: tweet.id_str,
            created_at: created_at,
            url: help.extractUrl(tweet.text),
            retweet_count: tweet.retweet_count,
            tweeted_by: screenName,
            profile_img: tweet.user.profile_image_url_https,
            background_img: tweet.user.profile_background_image_url_https,
            text: tweet.text
          }
          if (i === body.length-1) {
            var maxID = tweet_id;
          }
          if (body.length < 2) {      // Handles case in which we exceed maximum tweets from a certain account
            return updateNextNewsOrg(screenName);
          }
          storeTweet(newTweet);
          searches.addTweet(newTweet, tweet.text);  // Indexes search-terms parsed out of the tweet's text
        }
        setTimeout(function(){
          if (!maxID && body.length === 0) {      // (also) Handles case in which we exceed maximum tweets from a certain account
            return updateNextNewsOrg(screenName);
          }
          requestNewTweets(screenName, sinceID, maxID);
        }, 5500);  // Twitter's request limit approximates to one request per five seconds
      } else {
        var maxID = search.qs.max_id;
        requestNewTweets(screenName, sinceID, maxID);
      }
    }
  })
};

// Finds the next news organization in line, then updates it with 'lastTweetStored'
var updateNextNewsOrg = function(screenName){
  var index = newsOrgs.indexOf(screenName);
  if (index !== newsOrgs.length-1) {
    setTimeout(function(){
      lastTweetStored(newsOrgs[index+1]);
    }, 5500);
  }
};

// Stores tweet in mongo db
var storeTweet = function(tweet){
  Tweet.create(tweet);
};

// module.exports();
