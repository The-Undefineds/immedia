var OAuth = require('./OAuth');
var request = require('request');
var utils = require('./utils.js');

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

          var tweetIdsToSend = [];
          var tweetsBySocialCount = {};
          for (var i = 0; i < body.statuses.length; i++) {
            var socialCount = body.statuses[i]['retweet_count'] + body.statuses[i]['favorite_count'];
            tweetsBySocialCount[socialCount] = body.statuses[i];
          }

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
              type: 'user'
            };
            console.log(tweetToSend);
            responseObj[date] = responseObj[date] || { source: 'twitter', children: [] };
            if (responseObj[date].children.length < 10) {
              responseObj[date].children.push(tweetToSend);
            }
          }
        callback(200, responseObj);
      }

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
  var responseObj = {};

  search.url = newUrl;
  search.qs = {user_id : params.id, include_rts : 'false'};
  search.headers.Authorization = OAuth(newUrl, 'user_id=' + params.id, 'include_rts=false');

  request(search, function(error, response, body){
    if(error) {
      callback(404, error);
    } else {
      body = Array.prototype.slice.call(JSON.parse(body));

      if (body[0]) {
        var tweetIdsToSend = [];
        var tweetsBySocialCount = {};

        for (var i = 0; i < body.length; i++) {
          var socialCount = body[i]['retweet_count'] + body[i]['favorite_count'];
          tweetsBySocialCount[socialCount] = body[i];
        }

        var topTweetCounts = Object.keys(tweetsBySocialCount).sort(function(a, b) {
          return b - a;
        }).slice(0, 20);

        for(var j = 0; j < topTweetCounts.length; j++) {

          var tweet = tweetsBySocialCount[topTweetCounts[j]];
          var date = utils.getSimpleDate(tweet.created_at);

          date = date.year + '-' + date.month + '-' + date.day;

          tweetToSend = {
            date: date,
            url: tweet.user.url,
            img: tweet.user.profile_image_url,
            tweet_id: tweet.id,
            tweet_id_str: tweet.id_str,
            type: 'user'
          };

          var daysAgo = utils.getDateFromToday(0, '') - date.replace(/[-]/gi, '');

          //If the tweets were dated within 28 days, aggregate the top three from any day therein
          if (daysAgo <= 28) {
            responseObj[date] = responseObj[date] || { source: 'twitter', children: [] };
            if (responseObj[date].children.length < 2) {
              responseObj[date].children.push(tweetToSend);
            }
          }
        }

        callback(200, responseObj);
      } else {
        grabTimeline(newUrl, params, callback);
      }
    }
  })
};

