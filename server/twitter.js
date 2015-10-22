/*
    file: twitter.js
    - - - - - - - - - - - - - 
    Twitter middleware exporting two functions:
    * one that finds a verified user on Twitter 
    via Twitter's Search API and return that user's timeline 
    * returns all tweets matching the query string
    from our database of Tweets from white-listed
    news source
 */

// Required node modules
var request = require('request');

// immedia dependencies
var OAuth = require('./OAuth.js');     // Helper functions that create OAuth signatures for Twitter API
var utils = require('./utils.js');  // Date helper functions
var keys = require('./keys.js');    // API keys file with five different Twitter API keys/secrets
var Search = require('./searches/controller.js');   // Mongoose controller for Searches collection

var immediaUserId = '3752256737';   // @immediaHQ Twitter UserId for use in identifying a request from homepage
var search = {                      // Standard parameters for forthcoming GET requests
  url : '',
  qs : {},
  method : 'GET',
  headers: {
    Authorization : ''
  }
}

module.exports = {
  /*
      Function invoked on request to /api/twitter
      that first searches for a verified Twitter user for the given
      query, which defaults to the @immediaHQ if the request came
      from the immedia homepage
   */
  getTweetsPerson : function(request, response){
    var queryString = request.body.searchTerm;
    queryString = queryString === 'immediahomepage' ? 'immediaHQ' : queryString;
    
    findTwitterUser(queryString, response);
    return;
  },

  /*
      Function invoked on request to /api/news
      that uses our imported Mongoose controller
      for the Search collection which houses an indexed
      database of all tweets with a given query string
   */
  getNewsTweets : function(request, response){
    var queryString = request.body.searchTerm;
    Search.retrieveTweets(queryString, response);
  }
};

// Function expression used in response chains to send response
function sendResponse(response, status, data) {
  response.status(status).send(data);
};

/*
    Sends a request to Twitter's User Search API endpoint
    to see if a verified user exists for the given query.
    If so, it invokes another helper function that retrieves
    the found user's recent Tweets.

    Given that we created our OAuth signature logic from scratch
    in order to interact with the Search API, and the OAuth
    signature logic is notoriously erratic, we recursively
    send requests until we receive a non-erroring response. This
    usually happens on the first or second try.
 */
function findTwitterUser(queryString, originalResponse) {
  search.url = 'https://api.twitter.com/1.1/users/search.json';
  search.qs = {q : queryString};
  search.headers.Authorization = OAuth(search.url, 'q=' + queryString);
  
  request(search, function(error, response, body) {
    if(error) sendResponse(originalResponse, 404, error);

    if(body) {
      body = JSON.parse(body)
    } else {
      sendResponse(originalResponse, 204, 'No Twitter users exist for that request');
      return;
    }

    // If OAuth signature worked, continue with processing
    if (!('errors' in body)) { 
      if(body.length === 0) {
        sendResponse(originalResponse, 204, 'No Twitter users exist for that request');
        return;
      }
      var user_id = body[0].id_str;
      var img = body[0].profile_image_url;
      var verified = body[0].verified;

      if(!verified) {
        sendResponse(originalResponse, 204, 'No verified Twitter user exists for that request');
        return;
      }

      grabTimeline(user_id, originalResponse);
    } else {
      // Otherwise continue generating an OAuth signature and sending a request
      findTwitterUser(queryString, originalResponse);
    }
  });
};

/*
    Invoked after a verified Twitter user is found to retrieve that user's Tweets,
    where that user's Twitter Id is passed as an argument.

    This request also needs to use OAuth, but uses a stabler form of authentication
    so shouldn't need to recursively retry request attempts. However, that logic
    is still included for redundancy.
 */
function grabTimeline(user_id, originalResponse){
  search.url = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
  search.headers.Authorization = 'Bearer ' + keys.twitterBearerToken;
  search.qs = {user_id : user_id, include_rts : 0, exclude_replies: 0, count: 200};

  request(search, function(error, response, body){
    if(error) sendResponse(originalResponse, 404, error);

    if(body) {
      body = JSON.parse(body)
    } else {
      sendResponse(originalResponse, 204, 'No Tweets exist for that request');
      return;
    }

    if (!('errors' in body)) {
      var tweetsArray = Array.prototype.slice.call(body);

      if(!tweetsArray[0]) {
        sendResponse(originalResponse, 204, 'No Tweets exist for that request');
        return;
      }

      processResponseData(tweetsArray, 5, originalResponse);
      return;

    } else {
      grabTimeline(params, originalResponse);
    }
  });
};

/*
    Handles logic for which Tweets should be returned to the timeline.
    For design purposes, the team didn't want to overcrowd the immedia
    timeline with 200 tweets if the user searched is an avid tweeter.
    As such, it prioritized only the Tweets with the most Retweets and
    Favorites, and limited the number that could be returned for any one
    day and week.
 */
function processResponseData(response, amountToDisplay, originalResponse) {
  var responseObj = {};
  var tweetsByWeek = [
    [utils.getDateFromToday(-7, '-'), 0],
    [utils.getDateFromToday(-14, '-'), 0],
    [utils.getDateFromToday(-21, '-'), 0],
    [utils.getDateFromToday(-28, '-'), 0]
  ];

  response.sort(function(a, b) {
    return (b['retweet_count'] + b['favorite_count']) - (a['retweet_count'] + a['favorite_count']);
  });

  outer:
  for(var i = 0; i < response.length; i++) {
    var tweet = response[i];
    var date = (tweet.user_id || tweet.user.id_str) === immediaUserId ? utils.getSimpleDate(new Date()) : utils.getSimpleDate(tweet.created_at);
    date = date.year + '-' + date.month + '-' + date.day;

    for(var j = 0; j < tweetsByWeek.length; j++) {
      if(date > tweetsByWeek[j][0] && tweetsByWeek[j][1] < amountToDisplay) {
        tweetToSend = {
          date: date,
          img: tweet.profile_img || tweet.user.profile_image_url,
          tweet_id: tweet.tweet_id_str || tweet.id_str,
          tweet_id_str: tweet.tweet_id_str || tweet.id_str,
          timestamp: tweet.timestamp || tweet.created_at
        };

        responseObj[date] = responseObj[date] || { source: 'twitter', children: [] };
        responseObj[date].children.push(tweetToSend);

        tweetsByWeek[j][1]++;
        continue outer;
      }
    }
  }
  sendResponse(originalResponse, 200, responseObj);
  return;
};