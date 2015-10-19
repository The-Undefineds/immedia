var Search  = require('./model.js'),
    help    = require('./helpers.js'),
    getDate = require('../utils.js'),
    Tweet = require('../tweets/model.js'),
    newsOrgs = require('../assets/assets.js').newsOrgsObjs;

var Q = require('q');

var newSearchRank = 1;

var monthAgo = new Date();
var month = monthAgo.getMonth();
monthAgo.setMonth(month - 1);
monthAgo = monthAgo.toString().slice(4, 15);

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
          if (term.rank && term.rank !== 1) {
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

                // termPopCount = calcPopCount(term.weeklyCount);
                // otherTermPopCount = calcPopCount(otherTerm.weeklyCount);

                //If the current search term's popularity count now exceeds the pop count of the next highest ranked
                //term, the current term's rank will be incremented, the other decremented.
                if (term.total > otherTerm.total) {
                // if (termPopCount > otherTermPopCount) {
                  term.rank--;
                  otherTerm.rank++;
                  term.save();
                  otherTerm.save();
                }
              }
            })
          }
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
    res.sendStatus(200);
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

  addTweet: function(tweet, text){
    var topicStrings = help.parseText(text),
        context = this,
        tweetAsString = JSON.stringify(tweet);
    topicStrings.forEach(function(string){
      Search.findOne({ search_term: string })
        .then(function(topic){
          if (topic !== null && topic.length !== 0 && topic.tweets.length !== 0) {
            var foundMatch = false;
            topic.tweets.forEach(function(item){
              var oldTweet = JSON.parse(item);
              if (oldTweet.created_at === tweet.created_at) {
                foundMatch = true;
                if (oldTweet.retweet_count < tweet.retweet_count) {
                  topic.tweets.pull(item);
                  topic.tweets.addToSet(tweetAsString);
                  topic.save();
                }
              }
            });
            if (!foundMatch) {
              topic.tweets.addToSet(tweetAsString);
              topic.save();
            }
          } else {
            context.addSearch(string, tweet);
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

  //Called from /api/news
  //Retrieve 3 tweets with the highest retweet count for each week for 1 month 
  //from the database based on the search term
  retrieveTweets: function(queryString, response){
    queryString = help.parseQueryString(queryString); //Parses the query string
    var context = this;
    if (queryString !== 'immediahomepage') {
      Search.findOne({ //Search the query string in the database
        search_term: queryString
      })
      .then(function(topic){
        if (topic !== null){
          //Sets up the initial variables for grabbing tweets for each week
          var highestRetweet = [],
          a = 0, b = 1, c = 2, i, j = 0,
          tweet,
          weeks = [[],[],[],[]],
          date = [{},{},{},{}];
          
          //Sets up the date, putting 7 dates on each index of the array date
          for (i = -1; i >= -28; i--){
            date[j][getDate.getDateFromToday(i + 1, '-')] = true;
            if (i !== 0 && i % 7 === 0) j++;
          }
          
          //Places each tweets on the approriate week, week 1-4, base on when the tweet was created
          //Uses the array date to specify which week the tweets fall into
          topic.tweets.forEach(function(item){
            tweet = JSON.parse(item);
            for (i = 0; i < 4; i++){
              if (date[i][help.getDate(tweet.created_at)]) {
                weeks[i].push(tweet);
                i += 100;
              }
            }
          })
          
          //Loops 4 times (week 1-4), grabbing 3 tweets with the highest retweet count
          for (i = 0; i < weeks.length; i++){
            for (j = 0; j < weeks[i].length; j++){
              tweet = weeks[i][j];
              
              //Checks the number of tweets in the array highestRetweet is below the required amount for the current week
              //week 1 should have 0 tweets to start
              //week 2 = 3, week 3 = 6, week 4 = 9
              if (highestRetweet.length <= (3 * i)) {
                highestRetweet[a] = tweet;
                highestRetweet[b] = {retweet_count:0};
                highestRetweet[c] = {retweet_count:0};
              }
              //If number of tweets inside the array highestRetweet is within the required amount
              //Checks each tweet's retweet count
              else {
                if (tweet.retweet_count > highestRetweet[a].retweet_count) {
                  highestRetweet[c] = highestRetweet[b];
                  highestRetweet[b] = highestRetweet[a];
                  highestRetweet[a] = tweet;
                }
                else if (tweet.retweet_count > highestRetweet[c].retweet_count) {
                  if (tweet.retweet_count > highestRetweet[b].retweet_count) {
                    highestRetweet[c] = highestRetweet[b];
                    highestRetweet[b] = tweet;
                  }
                  else highestRetweet[c] = tweet;
                }
              }
            }
            a += 3;
            b += 3;
            c += 3;
          }
    
          var objToSend = {}; //The obj to be sent to the client
          context.processNewsTweets(highestRetweet, objToSend);
          response.status(200).send(objToSend);
        }
      });
    } else {
      //If the query string is immediahomepage
      //Looks in the database to find the tweet made by immediaHQ
      var context = this;
      Tweet.model.findOne({created_at: monthAgo})
      .then(function(tweet){
        context.retrieveHomepageTweets(tweet.tweet_id, response);
      })
    }
  },

  retrieveHomepageTweets: function(id, response){
    var count = 0,
        objToSend = {},
        context = this;
    // Finds top 15 news tweets in the database from the past month
    Tweet.model.find({ $and: [{ $or: newsOrgs }, { tweet_id: { $gt: id } }]}).sort({ retweet_count: 1 })
      .then(function(data) {
        var highestRetweet = data.slice(data.length - 16);
        context.processNewsTweets(highestRetweet, objToSend);
        count++;
        if (count === 2) {
          response.status(200).send(objToSend);
        }
      })
    // Finds the top 5 vocativ tweets from the past month
    Tweet.model.find({ $and: [{ tweeted_by: 'vocativ' }, { tweet_id: { $gt: id } }]}).sort({ retweet_count: 1 })
      .then(function(data) {
        var highestRetweet = data.slice(data.length - 6);
        context.processNewsTweets(highestRetweet, objToSend);
        count++;
        if (count === 2) {
          response.status(200).send(objToSend);
        }
      })
    },

    processNewsTweets: function(tweets, obj){
      for (i = 0; i < tweets.length; i++){
          if (!tweets[i] || !tweets[i].created_at) continue;
          var date = help.getDate(tweets[i].created_at);
          obj[date] = obj[date] || { source: 'twitter news', children: []};

          obj[date].children.push({
            date: date,
            tweet_id: tweets[i].tweet_id,
            tweet_id_str: tweets[i].tweet_id_str,
            url: tweets[i].url || '',
            img: tweets[i].profile_img || '',
            background: tweets[i].background_img || '',
            newssource: tweets[i].tweeted_by || 'The Void',
            text: tweets[i].text || ''
          })
        }
    }
};