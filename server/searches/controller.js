var Search = require('./model.js');

var Q = require('q');

var newSearchRank = 1;

module.exports = {

  incrementSearchTerm: function(req, res, next) {
    var context = this;
    var searchTerm = req.body.searchTerm;

    //If a search term is found in the database, the total number of searches is incremented by 1
    //The search term is then ranked based on its updated total
    Search.findOneAndUpdate({ search_term: searchTerm }, { $inc: { total: 1 } })
      .then (function(term) {
        if (term) {
          Search.findOne({ rank: term.rank - 1 })
            .then(function(otherTerm) {
              if(otherTerm) {
                if (term.total > otherTerm.total) {
                  Search.findOneAndUpdate({ search_term: term.search_term }, { $dec: { rank: 1 }});
                  Search.findOneAndUpdate({ search_term: otherTerm.search_term }, { $inc: { rank: 1 }});
                  console.log(otherTerm.search_term, otherTerm.total);
                  console.log(term.search_term, term.total)
                }
              }
            })
        } else {
          Search.create({
            rank: newSearchRank,
            count: [],
            total: 1,
            search_term: searchTerm,
          });
          newSearchRank++;
      }
    })
  },

  getPopularSearches: function(req, res, next) {
    //Will retreive all searches that are ranked from 1 to 20 in popularity
    Search.find({ rank: { $gte: 1, $lte: 20 }})
      .then(function (searches) {
        if (searches) {
          var responseObj = {};
          for (var i = 0; i < searches.length; i++) {
            responseObj[searches[i].search_term] = searches[i].rank
          };
          res.status(200).send(responseObj);
        } else {
          console.log('Could not retreive most popular searches');
          res.status(401).send()
        }
      })
  }

};