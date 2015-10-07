var Tweet = require('./model.js');

var Q = require('q');

module.exports = {

  lastTweetStored: function(screenName){
    
    var findTweets = Q.nbind(Tweet.find, Tweet);
    var create = Q.nbind(Tweet.create, Tweet);

    Tweet.create({
      tweet_id: 643597146789298176,
      tweeted_by: '@BradPittsPage',
      text: 'How can I not love my Mother, when she carried me first in her body, then in her arms and for a lifetime in her heart',
      url: 'https://twitter.com/BradPittsPage/statuses/643597146789298176',
      search_tags: ['Mother', 'heart'],
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