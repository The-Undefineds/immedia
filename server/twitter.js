var OAuth = require('./OAuth');
var request = require('request');
var utils = require('./utils.js');

var Search = require('./searches/controller.js');
var User = require('./users_twitter/controller.js');
var Timeline = require('./timelines/controller.js');

var userSearchUrl = 'https://api.twitter.com/1.1/users/search.json';
var userStatusUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
var searchTweetsUrl = 'https://api.twitter.com/1.1/search/tweets.json';

var search = {
  url : '',
  qs : {},
  method : 'GET',
  headers: {
    Authorization : ''
  }
}

var homepage = false;


var sendResponse = function(response, status, data) {
  response.status(status).send(data);
};

var handleUserSearch = function(queryString, callback, cachedUser) {
  if(cachedUser) {
    Timeline.findTimeline(cachedUser.user_id, handleTimelineSearch.bind(null, callback));
    return;
  }
  
  findTwitterUser(queryString, callback);
  return;
};

var handleTimelineSearch = function(callback, params, cachedTweets) {
  if(cachedTweets && !params.since_id) {
    processResponseData(cachedTweets, 3, callback);
    return;
  }

  grabTimeline(params, callback, cachedTweets);
  return;
};

var findTwitterUser = function(queryString, callback) {
  search.url = userSearchUrl;
  search.qs = {q : queryString};
  search.headers.Authorization = OAuth(userSearchUrl, 'q=' + queryString);
  
  request(search, function(error, response, body) {
    if(error) callback(404, error);
    
    body = JSON.parse(body);
    //If the user is on the home page, a general search will populate the timeline with popular recent tweets.
    if (queryString === 'news') {
      if (body.statuses) {
        processResponseData(body.statuses, 10, callback)
      }
    } else {

      if (!('errors' in body)) { 
        var user_id = body[0].id_str;
        var img = body[0].profile_image_url;

        User.insertUser({
          'search_term': queryString,
          'user_id': user_id,
          'img': img
        });

        grabTimeline({'user_id': user_id, 'since_id': undefined}, callback);
      } else {
        findTwitterUser(queryString, callback);
      }
    }
  });
};

var grabTimeline = function(params, callback, cachedTweets){
  search.url = userStatusUrl;
  search.headers.Authorization = 'Bearer ' + keys.twitterBearerToken;
  search.qs = {user_id : params.user_id, include_rts : 1, exclude_replies: 0};
  params.since_id !== undefined ? search.qs.since_id = params.since_id : null;

  request(search, function(error, response, body){
    if(error) callback(404, error);
    
    body = Array.prototype.slice.call(JSON.parse(body));

    if (!('errors' in body)) {
      if(!body[0]) {
        processResponseData(cachedTweets, 3, callback);
        return;
      }

      if(cachedTweets) {
        Timeline.updateTimeline(body, cachedTweets);
        processResponseData(body.concat(cachedTweets), 3, callback);
        return;
      }

      Timeline.insertTimeline(body);
      processResponseData(body, 3, callback);
      return;

    } else {
      grabTimeline(params, callback);
    }
  });
};

var processResponseData = function(response, amountToDisplay, callback) {
  var responseObj = {};
  var tweetIdsToSend = [];
  var tweetsBySocialCount = {};

  for (var i = 0; i < response.length; i++) {
    var socialCount = response[i]['retweet_count'] + response[i]['favorite_count'];
    tweetsBySocialCount[socialCount] = response[i];
  };

  var topTweetCounts = Object.keys(tweetsBySocialCount).sort(function(a, b) {
    return b - a;
  });

  for(var j = 0; j < topTweetCounts.length; j++) {
    var tweet = tweetsBySocialCount[topTweetCounts[j]];
    var date = homepage ? utils.getSimpleDate(new Date()) : utils.getSimpleDate(tweet.timestamp);
    date = date.year + '-' + date.month + '-' + date.day;

    // if (tweet.lang !== 'en') { continue; };

    tweetToSend = {
      date: date,
      img: tweet.profile_img,
      tweet_id: tweet.tweet_id,
      tweet_id_str: String(tweet.tweet_id),
    };

    responseObj[date] = responseObj[date] || { source: 'twitter', children: [] };
    if (responseObj[date].children.length < amountToDisplay) {
      responseObj[date].children.push(tweetToSend);
    }
  }
  callback(200, responseObj);
  return;
};

module.exports = {
  
  getTweetsPerson : function(request, response){
    var queryString = request.body.searchTerm;
    if (queryString === 'immediahomepage') {
      homepage = true;
      User.findUser('immediaHQ', handleUserSearch.bind(null, queryString, sendResponse.bind(null, response)));
      return;
    }
    
    User.findUser(queryString, handleUserSearch.bind(null, queryString, sendResponse.bind(null, response)));
    return;
  },

  getNewsTweets : function(request, response){
    var queryString = request.body.searchTerm;
    Search.retrieveTweets(queryString, response);
  }
};

