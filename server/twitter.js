var OAuth = require('./OAuth');
var request = require('request');
var utils = require('./utils.js');

var baseUrl = 'https://api.twitter.com/1.1/users/search.json';
var newUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
// var url = 'https://api.twitter.com/1/statuses/oembed.json';

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
    console.log('search term:', queryString);
    findUser(baseUrl, queryString, function(status, data){
      response.status(status).send(data);
    });
  }
}

function findUser(baseUrl, queryString, callback){
  search.url = baseUrl;
  search.qs = {q : queryString};
  search.headers.Authorization = OAuth(baseUrl, 'q=' + queryString);
  request(search, function(error, response, body){
    if(error) {
      callback(404, error);
    } else {
      body = JSON.parse(body);
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
        }).slice(0, 6);

        for(var j = 0; j < topTweetCounts.length; j++) {
          // tweetIdsToSend.push(tweetsBySocialCount[topTweetCounts[j]]);
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
          
          responseObj[date] = responseObj[date] || { source: 'twitter', children: [] };
          responseObj[date].children.push(tweetToSend);
          
        }

        callback(200, responseObj);
        // embedTweet(url, tweetIdsToSend, callback, {'date': date, 'img': params.img});
      } else {
        grabTimeline(newUrl, params, callback);
      }
    }
  })
};

// function embedTweet(url, tweetIds, callback, params){
//   var obj = {};
//   var manualPromise = 0;
//   obj[params.date] = {
//     source : 'twitter',
//     children : []
//   }
  
//   search.url = url;
//   search.headers.Authorization = null;
  
//   for (var i = 0; i < tweetIds.length; i++){
//     search.qs = {id : tweetIds[i], omit_script: 'true'};
//     request(search, function(error, response, body){
//       if(error) {
//         callback(404, error);
//       } else {
//         body = JSON.parse(body);  
//         obj[params.date].children.push({
//           url : body.url,
//           tweet : body.html,
//           img: params.img,
//           // tweetid: tweetId,
//           type: 'user'
//         })
//         manualPromise++;
//         if (manualPromise === 3) callback(200, obj);
//       }
//     })
//   }
// }
