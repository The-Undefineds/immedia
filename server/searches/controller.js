var Search  = require('./model.js'),
    help    = require('./helpers.js');

var Q = require('q');

var newSearchRank = 1;

module.exports = {

  incrementSearchTerm: function(req, res, next) {
    var context = this;
    var searchTerm = req.body.searchTerm;
    var img = req.body.img;

    //If a search term is found in the database, the total number of searches is incremented by 1
    //The search term is then ranked based on its updated total
    Search.findOneAndUpdate({ search_term: searchTerm }, { $inc: { total: 1 }})
    // Search.findOneAndUpdate({ search_term: searchTerm }, { $inc: { total: 1 }, { weeklyCount[0]: 1 } })
      .then (function(term) {
        if (term) {
          Search.findOne({ rank: term.rank - 1 })
            .then(function(otherTerm) {
              if(otherTerm) {

                //The total popularity count will be calculated with priority on the current week's search total
                //(denoted by searchCountArr[0]).
                var calcPopCount = function(searchCountArr) {
                  var popCount = 0;
                  for (var i = 0; i < searchCountArr; i++) {
                    popCount = popCount + searchCountArr[i]*(4/i);
                  }
                  return popCount;
                }

                termPopCount = calcPopCount(term.weeklyCount);
                otherTermPopCount = calcPopCount(otherTerm.weeklyCount);

                //If the current search term's popularity count now exceeds the pop count of the next highest ranked
                //term, the current term's rank will be incremented, the other decremented.
                if (term.total > otherTerm.total) {
                // if (termPopCount > otherTermPopCount) {
                  Search.findOneAndUpdate({ search_term: term.search_term }, { $inc: { rank: 1 }});
                  Search.findOneAndUpdate({ search_term: otherTerm.search_term }, { $inc: { rank: -1 }});
                }
              }
            })
        } else {
          //If the current search term is not found in the database, a new entry will be created with a ranking
          //equal to the number of search terms in the database.
          Search.create({
            rank: newSearchRank,
            count: [],
            total: 1,
            search_term: searchTerm,
            img: img,
          });
          newSearchRank++;
      }
    })
  },

  getPopularSearches: function(req, res, next) {

    // Will retreive all searches that are ranked from 1 to 20 in popularity
    Search.find({ rank: { $gte: 1, $lte: 10 }})
      .then(function (searches) {
        if (searches) {
          var responseObj = {};
          for (var i = 0; i < searches.length; i++) {
            responseObj[searches[i].search_term] = {
              rank: searches[i].rank,
              img: searches[i].img
            }
          };
          res.status(200).send(responseObj);
        } else {
          console.log('Could not retreive most popular searches');
          res.status(401).send()
        }
      });
  },

  // 
  addTweet: function(tweet, text){
    var topicStrings = help.parseText(text), // Separates tweet text into plausible search-term strings
        context = this,
        tweetAsString = JSON.stringify(tweet);  // For saving later in Mongo db (for comparability)

    // 'forEach' of our search-terms, we either (A) make a new table for it (if there isn't one already), 
    // (B) decide whether to add it to an existing table. We only add the tweet if there is (C) no other tweet 
    // already stored for that day, or (D) it has a higher retweet count than the tweet already stored for 
    // that day. (The point is to only store the tweet with the most tweets for each search-term string per day)
    topicStrings.forEach(function(string){
      Search.findOne({ search_term: string })
        .then(function(topic){
          if (topic !== null && topic.length !== 0 && topic.tweets.length !== 0) {   // (B)
            var foundMatch = false;
            topic.tweets.forEach(function(item){
              var oldTweet = JSON.parse(item);
              if (oldTweet.created_at === tweet.created_at) {
                foundMatch = true;
                if (oldTweet.retweet_count < tweet.retweet_count) {  // (D)
                  topic.tweets.pull(item);
                  topic.tweets.addToSet(tweetAsString);
                  topic.save();
                }
              }
            });
            if (!foundMatch) {   // (C)
              topic.tweets.addToSet(tweetAsString);
              topic.save();
            }
          } else {
            context.addSearch(string, tweet); // (A)
          }
        });
    });
  },

  addSearch: function(string, tweet){
    var tweet = JSON.stringify(tweet);
    Search.create({
      search_term: string,
      tweets: [ tweet ]
    });
  },

  retrieveTweets: function(queryString, response){
    console.log('retrieving tweets')
    Search.find({
      search_term: queryString
    })
      .then(function(topic){
        console.log(JSON.stringify(topic));
      });
  }

};