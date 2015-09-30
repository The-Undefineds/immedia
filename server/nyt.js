// var keys = require('./keys.js');
var Q = require('Q');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var getDateFromToday = function(days, delimiter) {
  delimiter = delimiter || '';
  var today = new Date();
  var desiredDate = new Date(today.setDate(today.getDate() + days));
  var year = desiredDate.getFullYear().toString();
  var month = (((desiredDate.getMonth()+1).toString()[1]) ? desiredDate.getMonth()+1 : "0" + (desiredDate.getMonth()+1)).toString();
  var day = ((desiredDate.getDate().toString()[1]) ? desiredDate.getDate() : "0" + desiredDate.getDate()).toString();

  return year + delimiter + month + delimiter + day;
};

module.exports = {

  'getArticles': function(req, res) {
    var searchTerm = req.body.searchTerm.replace(/\s/g, '+');   // Remove spaces in searchTerm and replace with '+'

    // NYT Article Search parameters (note: CAN search by topic)
    var articleSearchURI = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?';
    var beginDate = getDateFromToday(-7);
    var articleSearch = {};
    var articleSearchDate = {};

    // Most-Popular NYT article parameters (note: cannot search by topic)
    var timePeriod = 7;
    var mostPopularURI = 'http://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/';
    var queryStringMostPopular = mostPopularURI + timePeriod + '.json?api-key=' + keys.nytMostPopular;
    var mostPopular = {};

    // Response results
    var results = {
      'source': 'nyt'
    };

    /*
      Create promise chain to search Most Popular articles and whether any
      articles for the given query match by the unique NYT website url
    */
    Q(articleSearchURI + 'q=' + searchTerm + '&' + 'begin_date=' + beginDate + '&' + 'page=' + 0 + '&' + 'api-key=' + keys.nytArticleSearch)
      .then(request)                                                                                // GET request for FIRST PAGE of Article Search results
      .then(function(response) {
        var body = JSON.parse(response[1]).response;
        var numArticles = body.meta.hits;                                                           // Overall number of articles for search query
        var articles = Array.prototype.slice.call(body.docs);                                       // Article objects for FIRST PAGE of Article Search results
        var getRequestURIs = [];
        var numRequests = Math.ceil(numArticles / 10) > 10 ? 10 : Math.ceil(numArticles / 10);      // Number of GET requests required to match all articles, NYT API request limit per second is 10

        for(var j = 0; j < articles.length; j++) {
          articleSearch[articles[j]['web_url']] = articles[j];                                      // Maintain object to track articles by NYT web url key
          if(articleSearchDate[articles[j]['pub_date'].substring(0, 10)] === undefined) {
            articleSearchDate[articles[j]['pub_date'].substring(0, 10)] = [
              articles[j]
            ];
          } else {
            articleSearchDate[articles[j]['pub_date'].substring(0, 10)].push(
              articles[j]
            );
          }
        }

        for(var i = 1; i < numRequests ; i++) {
          getRequestURIs.push(                                                                      // Create an array to carry-out parallel async requests
            request(articleSearchURI + 'q=' + searchTerm + '&' + 'begin_date=' + beginDate + '&' + 'page=' + i + '&' + 'api-key=' + keys.nytArticleSearch)
          );
        }
        return getRequestURIs;
      })
      .all()                                                                                        // Carry out parallel async requests
      .then(function(responses) {
        for(var i = 0; i < responses.length; i++) {
          var articles = Array.prototype.slice.call(JSON.parse(responses[i][1]).response.docs);
          for(var j = 0; j < articles.length; j++) {
            articleSearch[articles[j]['web_url']] = articles[j];                                    // Add articles from parallel async requests to object from line 46
          }
        }
      })
      .then(function() {
        return request(queryStringMostPopular);                                                     // Send Most Popular GET request (20 results default)
      })
      .then(function(response) {
        var articles = Array.prototype.slice.call(JSON.parse(response[1]).results);
        for(var i = 0; i < articles.length; i++) {
          mostPopular[articles[i]['url']] = articles[i];                                            // Maintain object to track most popular articles by NYT web url key
        }
        return;
      })
      .then(function() {
        for(var article in mostPopular) {
          if(article in articleSearch) {
            if(results[mostPopular[article]['published_date']] === undefined) {
              results[mostPopular[article]['published_date']] = {
                'source': 'nyt',
                'children': [
                  {
                    'title': mostPopular[article]['title'],
                    'url': mostPopular[article]['url'],
                    'img': (mostPopular[article]['media']['0']['media-metadata']['url'] || ''),
                    'date': mostPopular[article]['published_date']
                  }
                ]
              };
            } else {
              results[mostPopular[article]['published_date']]['children'].push(
                {
                  'title': mostPopular[article]['title'],
                  'url': mostPopular[article]['url'],
                  'img': (mostPopular[article]['media']['0']['media-metadata']['url'] || ''),
                  'date': mostPopular[article]['published_date']
                }
              );
            }
          }
        }
        if(Object.keys(articleSearchDate).length !== 0) {
          var dates = Object.keys(articleSearchDate).sort(function(a, b) {
            return Number(b.substring(b.length - 2)) - Number(a.substring(a.length - 2));
          });
          var articles = articleSearchDate[dates[0]];
          for(var i = 0; i < articles.length; i++) {
            if(results[dates[0]] === undefined) {
              results[dates[0]] = {
                'source': 'nyt',
                'children': [
                  {
                    'title': articles[i]['headline']['main'],
                    'url': articles[i]['web_url'],
                    'img': '',
                    'date': dates[0]
                  }
                ]
              };
            } else {
              var existingArticles = results[dates[0]]['children'];
              for(var j = 0; j < existingArticles.length; j++) {
                if(articles[i]['web_url'] === existingArticles[j]['url']) {
                  break;
                }
              }
              if(j === existingArticles.length) {
                results[dates[0]]['children'].push(
                  {
                    'title': articles[i]['headline']['main'],
                    'url': articles[i]['web_url'],
                    'img': '',
                    'date': dates[0]
                  }
                );
              }
            }
          }
        }

        res.send(results);
        return;
      })
      .done();
  }

};