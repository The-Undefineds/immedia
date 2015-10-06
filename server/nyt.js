var keys = (process.env.NODE_ENV === 'production') ? require('../../keys.js') : require('./keys.js');
var utils = require('./utils.js');
var Q = require('q');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var getPictureArticleSearch = function(article) {
  var baseURL = 'http://www.nytimes.com/';
  var pictures = article['multimedia'];

  for(var picture in pictures) {
    if(pictures[picture]['subtype'] !== 'thumbnail' && pictures[picture]['subtype'] !== 'wide') {
      return {
        'url': baseURL + pictures[picture]['url'],
        'height': pictures[picture]['height'],
        'width': pictures[picture]['width']
      };
    }
  }
  return;
};

module.exports = {

  'getArticles': function(req, res) {
    var searchTerm = req.body.searchTerm.replace(/\s/g, '+');   // Remove spaces in searchTerm and replace with '+'

    // NYT Article Search parameters (note: CAN search by topic)
    var articleSearchURI = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?';
    var beginDate = utils.getDateFromToday(-7);
    var articleSearch = {};
    var articleSearchDate = {};

    // Most-Popular NYT article parameters (note: cannot search by topic)
    var timePeriod = 7;
    var mostPopularURI = 'http://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/';
    var queryStringMostPopular = mostPopularURI + timePeriod + '.json?api-key=' + keys.nytMostPopular;
    var mostPopular = {};

    // Response results
    var results = {};

    /*
      Create promise chain to search Most Popular articles and whether any
      articles for the given query match by the unique NYT website url
    */
    Q(articleSearchURI + 'q=' + searchTerm + '&fq=body:("' + searchTerm + '")&' + 'begin_date=' + beginDate + '&' + 'page=' + 0 + '&' + 'api-key=' + keys.nytArticleSearch)
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
            request(articleSearchURI + 'q=' + searchTerm + '&fq=body:("' + searchTerm + '")&' + 'begin_date=' + beginDate + '&' + 'page=' + i + '&' + 'api-key=' + keys.nytArticleSearch)
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
            var publishedDate = utils.correctDateInFuture(mostPopular[article]['published_date'], '-');
            if(results[publishedDate] === undefined) {
              results[publishedDate] = {
                'source': 'nyt',
                'children': [
                  {
                    'title': mostPopular[article]['title'].replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\''),
                    'url': mostPopular[article]['url'],
                    'img': (mostPopular[article]['media']['0'] === undefined ? '' : mostPopular[article]['media']['0']['media-metadata']['0']['url']),
                    'height': (mostPopular[article]['media']['0'] === undefined ? '' : mostPopular[article]['media']['0']['media-metadata']['0']['height']),
                    'width': (mostPopular[article]['media']['0'] === undefined ? '' : mostPopular[article]['media']['0']['media-metadata']['0']['width']),
                    'date': publishedDate,
                    'byline': mostPopular[article]['byline'],
                    'abstract': (mostPopular[article]['abstract'])
                  }
                ]
              };
            } else {
              results[publishedDate]['children'].push(
                {
                  'title': mostPopular[article]['title'].replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\''),
                  'url': mostPopular[article]['url'],
                  'img': (mostPopular[article]['media']['0'] === undefined ? '' : mostPopular[article]['media']['0']['media-metadata']['0']['url']),
                  'height': (mostPopular[article]['media']['0'] === undefined ? '' : mostPopular[article]['media']['0']['media-metadata']['0']['height']),
                  'width': (mostPopular[article]['media']['0'] === undefined ? '' : mostPopular[article]['media']['0']['media-metadata']['0']['width']),
                  'date': publishedDate,
                  'byline': mostPopular[article]['byline'],
                  'abstract': (mostPopular[article]['abstract'])
                }
              );
            }
          }
        }
        if(Object.keys(articleSearchDate).length !== 0) {
          var dates = Object.keys(articleSearchDate).sort(function(a, b) {
            var aDate = new Date(a);
            var bDate = new Date(b);
            return bDate - aDate;
          });
          var articles = articleSearchDate[dates[0]].concat((articleSearchDate[dates[1]] || []));
          for(var i = 0; i < articles.length; i++) {
            var date = utils.correctDateInFuture(articles[i]['pub_date'].substring(0, 10), '-');
            var img = getPictureArticleSearch(articles[i]);
            if(results[date] === undefined) {
              results[date] = {
                'source': 'nyt',
                'children': [
                  {
                    'title': articles[i]['headline']['main'].replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\''),
                    'url': articles[i]['web_url'],
                    'img': (img === undefined ? '' : img['url']),
                    'height': (img === undefined ? '' : img['height']),
                    'width': (img === undefined ? '' : img['width']),
                    'date': date,
                    'byline': articles[i]['byline']['original'],
                    'abstract': (articles[i]['abstract'] === null ? articles[i]['snippet'] : articles[i]['abstract'])
                  }
                ]
              };
            } else {
              var existingArticles = results[date]['children'];
              for(var j = 0; j < existingArticles.length; j++) {
                if(articles[i]['web_url'] === existingArticles[j]['url']) {
                  break;
                }
              }
              if(j === existingArticles.length) {
                results[date]['children'].push(
                  {
                    'title': articles[i]['headline']['main'].replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\''),
                    'url': articles[i]['web_url'],
                    'img': (img === undefined ? '' : img['url']),
                    'height': (img === undefined ? '' : img['height']),
                    'width': (img === undefined ? '' : img['width']),
                    'date': date,
                    'byline': articles[i]['byline']['original'],
                    'abstract': (articles[i]['abstract'] === null ? articles[i]['snippet'] : articles[i]['abstract'])
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