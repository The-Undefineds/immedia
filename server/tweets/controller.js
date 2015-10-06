var Tweet = require('./model.js');

var Q = require('q');

module.exports = {

  lastTweetStored: function(screenName){
    
    var findTweets = Q.nbind(Tweet.find, Tweet);
    var create = Q.nbind(Tweet.create, Tweet);

    Tweet.create({
      tweet_id: 1,
      tweeted_by: 'OJ'
    })


    findTweets({
          tweeted_by: screenName
        })
          .then(function(tweets) {
            console.log('TWEETS * * * : ', tweets);
          });

    // Tweet.create({tweet_id: 1, })

  }

};