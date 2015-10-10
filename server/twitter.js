var OAuth = require('./OAuth');
var request = require('request');
var utils = require('./utils.js');
var searches = require('./searches/controller.js');

var baseUrl = 'https://api.twitter.com/1.1/users/search.json';
var newUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
var searchTweetsUrl = 'https://api.twitter.com/1.1/search/tweets.json';

var tweets = {};

var search = {
  url : '',
  qs : {},
  method : 'GET',
  headers: {
    Authorization : ''
  }
}

module.exports = {
  
  getTweetsPerson : function(request, response){
    var queryString = request.body.searchTerm;
    if (queryString === 'immediahomepage') {
      findUser(searchTweetsUrl, 'news', function(status, data) {
        response.status(status).send(data);
      })
    } else {
      findUser(baseUrl, queryString, function(status, data){
        response.status(status).send(data);
      });
    }
  },

  getNewsTweets : function(request, response){
    var queryString = request.body.searchTerm.toLowerCase();
    console.log('search term:', queryString);
    searches.retrieveTweets(queryString, response);
  }
}

function findUser(baseUrl, queryString, callback){
  var responseObj = {};
  search.url = baseUrl;
  search.qs = {q : queryString};
  search.headers.Authorization = OAuth(baseUrl, 'q=' + queryString);
  request(search, function(error, response, body){
    if(error) {
      callback(404, error);
    } else {
      body = JSON.parse(body);
      //If the user is on the home page, a general search will populate the timeline with popular recent tweets.
      if (queryString === 'news') {
        if (body.statuses) {
          processResponseData(body.statuses, 10, callback)
      };
     } else {
        var id,
            img;

        if (!('errors' in body)) { 
          id = body[0].id;
          img = body[0].profile_image_url;

          grabTimeline(newUrl, {'id': id, 'img': img}, callback);
        }
        else {
          findUser(baseUrl, queryString, callback);
        }
      }
    }
  })
}

function grabTimeline(newUrl, params, callback){

  search.url = newUrl;
  search.qs = {user_id : params.id, include_rts : 'false'};
  search.headers.Authorization = OAuth(newUrl, 'user_id=' + params.id, 'include_rts=false');

  request(search, function(error, response, body){
    if(error) {
      callback(404, error);
    } else {
      body = Array.prototype.slice.call(JSON.parse(body));

      if (body[0]) {
        processResponseData(body, 3, callback);
      } else {
        grabTimeline(newUrl, params, callback);
      }
    }
  })
};

function processResponseData(response, amountToDisplay, callback) {
  
  var responseObj = {};
  var tweetIdsToSend = [];
  var tweetsBySocialCount = {};

  for (var i = 0; i < response.length; i++) {
    var socialCount = response[i]['retweet_count'] + response[i]['favorite_count'] + response[i].id;
    tweetsBySocialCount[socialCount] = response[i];
  };

  var topTweetCounts = Object.keys(tweetsBySocialCount).sort(function(a, b) {
    return b - a;
  });

  for(var j = 0; j < topTweetCounts.length; j++) {

    var tweet = tweetsBySocialCount[topTweetCounts[j]];
    var date = utils.getSimpleDate(tweet.created_at);

    if (tweet.lang !== 'en') { continue; };

    date = date.year + '-' + date.month + '-' + date.day;

    tweetToSend = {
      date: date,
      url: tweet.user.url,
      img: tweet.user.profile_image_url,
      tweet_id: tweet.id,
      tweet_id_str: tweet.id_str,
      type: 'news'
    };
 
    responseObj[date] = responseObj[date] || { source: 'twitter', children: [] };
    if (responseObj[date].children.length < amountToDisplay) {
      responseObj[date].children.push(tweetToSend);
    }
  }
  callback(200, responseObj);
};

