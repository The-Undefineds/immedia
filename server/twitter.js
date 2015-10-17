var OAuth = require('./OAuth');
var request = require('request');
var utils = require('./utils.js');
var keys = require('./keys.js');

var Search = require('./searches/controller.js');
var User = require('./users_twitter/controller.js');
var Timeline = require('./timelines/controller.js');

var userSearchUrl = 'https://api.twitter.com/1.1/users/search.json';
var userStatusUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
var searchTweetsUrl = 'https://api.twitter.com/1.1/search/tweets.json';
var immediaUserId = '3752256737';

var search = {
  url : '',
  qs : {},
  method : 'GET',
  headers: {
    Authorization : ''
  }
}

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
    processResponseData(cachedTweets, 5, callback);
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
    
    if(body) { body = JSON.parse(body); };
    //If the user is on the home page, a general search will populate the timeline with popular recent tweets.
    if (queryString === 'news') {
      if (body.statuses) {
        processResponseData(body.statuses, 5, callback)
      }
    } else {

      if (!('errors' in body)) { 
        if(body.length === 0) {
         callback(204, 'No Twitter users exist for that request');
          return;
        }

        var user_id = body[0].id_str;
        var img = body[0].profile_image_url;

        User.insertUser({
          'search_term': queryString.toLowerCase(),
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
  search.qs = {user_id : params.user_id, include_rts : 1, exclude_replies: 0, count: 200};
  params.since_id !== undefined ? search.qs.since_id = params.since_id : null;

  request(search, function(error, response, body){
    if(error) callback(404, error);

    var tweets = JSON.parse(body);

    if (!('errors' in tweets)) {
      var tweetsArray = Array.prototype.slice.call(tweets);

      if(!tweetsArray[0]) {
        if(cachedTweets) {
          processResponseData(cachedTweets, 5, callback);
          return;
        }

        callback(204, 'No Tweets exist for that request');
        return;
      }

      if(cachedTweets) {
        Timeline.updateTimeline(tweetsArray, cachedTweets);
        processResponseData(tweetsArray.concat(cachedTweets), 5, callback);
        return;
      }

      Timeline.insertTimeline(tweetsArray);
      processResponseData(tweetsArray, 5, callback);
      return;

    } else {
      grabTimeline(params, callback);
    }
  });
};

var processResponseData = function(response, amountToDisplay, callback) {
  var responseObj = {};
  var tweetsByWeek = [0, 0, 0, 0];

  response.sort(function(a, b) {
    return (b['retweet_count'] + b['favorite_count']) - (a['retweet_count'] + a['favorite_count']);
  });

  for(var i = 0; i < response.length; i++) {
    var tweet = response[i];
    var date = homepage ? utils.getSimpleDate(new Date()) : utils.getSimpleDate(tweet.created_at);

    date = date.year + '-' + date.month + '-' + date.day;

    if(date > utils.getDateFromToday(-7, '-')) {
      if(tweetsByWeek[0] <= amountToDisplay) {
        tweetsByWeek[0]++;
      } else {
        continue;
      }
    } else if(date > utils.getDateFromToday(-14, '-')) {
      if(tweetsByWeek[1] <= amountToDisplay) {
        tweetsByWeek[1]++;
      } else {
        continue;
      }
    } else if(date > utils.getDateFromToday(-21, '-')) {
      if(tweetsByWeek[2] <= amountToDisplay) {
        tweetsByWeek[2]++;
      } else {
        continue;
      }
    } else if(date > utils.getDateFromToday(-28, '-')) {
      if(tweetsByWeek[3] <= amountToDisplay) {
        tweetsByWeek[3]++;
      } else {
        continue;
      }
    }

    tweetToSend = {
      date: date,
      img: tweet.profile_img,
      tweet_id: tweet.tweet_id_str,
      tweet_id_str: tweet.tweet_id_str,
      timestamp: tweet.timestamp,
    };

    responseObj[date] = responseObj[date] || { source: 'twitter', children: [] };
    responseObj[date].children.push(tweetToSend);
  }
  callback(200, responseObj);
  return;
};

module.exports = {
  
  getTweetsPerson : function(request, response){
    var queryString = request.body.searchTerm;
    if (queryString === 'immediahomepage') {
      User.findUser(queryString, handleUserSearch.bind(null, queryString, sendResponse.bind(null, response)));
      return;
    }
    
    User.findUser(queryString.toLowerCase(), handleUserSearch.bind(null, queryString, sendResponse.bind(null, response)));
    return;
  },

  getNewsTweets : function(request, response){
    var queryString = request.body.searchTerm;
    Search.retrieveTweets(queryString, response);
  }
};

