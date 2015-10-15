var utils = require('../utils.js');

var Timeline = require('./model.js');
var Tweet = require('../tweets/model.js').model;

var fifteenMinutesInMs = 900000;

var findTweets = function(tweetArray, callback) {
  var tweetArrayById = [];

  for(var i = 0; i < tweetArray.length; i++) {
    tweetArrayById.push(tweetArray[i].id_str);
  }

  Tweet.find({
    'tweet_id': { $in: tweetsById }
  }).then(function(tweetResults) {
    callback(tweetResults);
  });

  return;
};

var prepareTweetsForInsertion = function(tweetArray) {
  for (var i = 0; i < tweetArray.length; i++) {
    var tweet = tweetArray[i];
    var created_at = utils.getSimpleDate(tweet.created_at);
    var timestamp = new Date(tweet.created_at);

    var newTweet = {
      tweet_id: tweet.id_str,
      created_at: created_at.year + '-' + created_at.month + '-' + created_at.day,
      url: undefined,
      retweet_count: tweet.retweet_count,
      favorite_count: tweet.favorite_count,
      tweeted_by: tweet.screen_name,
      profile_img: tweet.user.profile_image_url_https,
      background_img: tweet.user.profile_background_image_url_https,
      text: tweet.text,
      user_id: tweet.user.id_str,
      timestamp: timestamp
    };

    tweetArray[i] = newTweet;
  }
  return;
};

var getSinceId = function(tweetArray) {
  var since_id;

  for(var i = 0; i < tweetArray.length; i++) {
    if(since_id === undefined || Number(tweetArray[i].tweet_id) > Number(since_id)) {
      since_id = tweetArray[i].tweet_id;
    }
  }

  return since_id;
};

module.exports = {
  findTimeline: function(user_id, callback) {
    Timeline.find({'user_id': user_id}, function(err, data) {
      if(err) console.error(err);

      var params = {
        'user_id': user_id,
        'since_id': undefined
      };

      if(data[0]) {
        var now = new Date();

        if((now - data[0]['last_updated']) > fifteenMinutesInMs) {
          params.since_id = data[0]['since_id'];
        }

        callback(params, Array.prototype.slice.call(data[0]['tweets']));
        return;
      }

      callback(params);
      return;
    });
  },

  insertTimeline: function(tweetArray) {
    prepareTweetsForInsertion(tweetArray);

    Tweet.collection.insert(tweetArray, function(err, data) {
      if(err) console.error(err);

      if (data.ops) data = Array.prototype.slice.call(data.ops);
      var since_id = getSinceId(data);

      if (data[0]) {
        Timeline.create({
          'user_id': data[0].user_id,
          'since_id': since_id,
          'tweets': data
        }, function(err) { console.error(err); });
      }

      return;
    });
    return;
  },

  updateTimeline: function(tweetArray, cachedTweets) {
    prepareTweetsForInsertion(tweetArray);

    Tweet.collection.insert(tweetArray, function(err, data) {
      if(err) console.error(err);

      data = Array.prototype.slice.call(data.ops);
      var since_id = getSinceId(data);

      Timeline.update({ 'user_id': data[0].user_id }, { $set: {
        'last_updated': new Date(),
        'since_id': since_id,
        'tweets': (data).concat(cachedTweets)
      }}, function(err) { console.error(err); });

      return;
    });
    return;
  }
};