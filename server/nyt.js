var keys = require('./keys.js');
var utils = require('./utils.js');
var Q = require('q');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var articleSearchURI = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?';
var mostPopularURI = 'http://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/';

var articleSearch = {};
var articleSearchDate = {};
var mostPopular = {};
var results = {};

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

var addArticleToArticleSearchDate = function(article) {
  if(articleSearchDate[article['pub_date'].substring(0, 10)] === undefined) {
    articleSearchDate[article['pub_date'].substring(0, 10)] = [ article ];
  } else {
    articleSearchDate[article['pub_date'].substring(0, 10)].push( article );
  }
};

var createArticleSearchMap = function(searchTerm, beginDate, response) {
  if(!response['1']) {
    return [];
  }
  var body = JSON.parse(response['1']).response;    // Parse request body
  var articles = Array.prototype.slice.call(body.docs);   // Article objects for FIRST PAGE of Article Search results
  var numArticles = body.meta.hits;   // Overall number of articles for search query
  var numRequests = Math.ceil(numArticles / 10) > 10 ? 10 : Math.ceil(numArticles / 10);    // Number of GET requests required to match all articles, NYT API request limit per second is 10
  var getRequestURIs = [];

  for(var j = 0; j < articles.length; j++) {
    articleSearch[articles[j]['web_url']] = articles[j];  // Maintain object to track articles by NYT web url key
    addArticleToArticleSearchDate(articles[j]);
  }

  for(var i = 1; i < numRequests ; i++) {
    var queryString = articleSearchURI + 'q=' + searchTerm + '&fq=headline:("' + searchTerm + '")&' + 'begin_date=' + beginDate + '&' + 'page=' + i + '&' + 'api-key=' + keys.nytArticleSearch;
    
    getRequestURIs.push(    // Create an array to carry-out parallel async requests
      request(queryString)
    );
  }
  return getRequestURIs;
};

var createMostPopularMap = function(timePeriod) {
  var getRequestURIs = [];
  
  for(var i = 0; i < 100; i += 20) {
    var queryString = mostPopularURI + timePeriod + '.json?offset=' + i + '&api-key=' + keys.nytMostPopular;
    
    getRequestURIs.push(
      request(queryString)
    );
  }
  return getRequestURIs;
};

var addArticlesToArticleSearch = function(responses) {
  for(var i = 0; i < responses.length; i++) {
    if(!responses[i]['1']) continue;
    var articles = Array.prototype.slice.call(JSON.parse(responses[i]['1']).response.docs);
    for(var j = 0; j < articles.length; j++) {
      articleSearch[articles[j]['web_url']] = articles[j];                                    // Add articles from parallel async requests to object from line 46
    }
  }
  return;
};

var addArticlesToMostPopular = function(responses) {
  for(var i = 0; i < responses.length; i++) {  
    if(!responses[i]['1']) continue;
    var articles = Array.prototype.slice.call(JSON.parse(responses[i]['1']).results);
    for(var j = 0; j < articles.length; j++) {
      mostPopular[articles[j]['url']] = articles[j];                                            // Maintain object to track most popular articles by NYT web url key
    }
  }
  return;
};

var createMostPopularArticle = function(article, date) {
  return {
    'title': mostPopular[article]['title'].replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\''),
    'url': mostPopular[article]['url'],
    'img': (mostPopular[article]['media']['0'] === undefined ? '' : mostPopular[article]['media']['0']['media-metadata']['0']['url']),
    'height': (mostPopular[article]['media']['0'] === undefined ? '' : mostPopular[article]['media']['0']['media-metadata']['0']['height']),
    'width': (mostPopular[article]['media']['0'] === undefined ? '' : mostPopular[article]['media']['0']['media-metadata']['0']['width']),
    'date': date,
    'byline': (mostPopular[article]['byline'] || '').replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\''),
    'abstract': (mostPopular[article]['abstract'] || '').replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\'')
  };
};

var createArticleSearchArticle = function(article, date, img) {
  return {
    'title': article['headline']['main'].replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\''),
    'url': article['web_url'],
    'img': (img === undefined ? '' : img['url']),
    'height': (img === undefined ? '' : img['height']),
    'width': (img === undefined ? '' : img['width']),
    'date': date,
    'byline': ((article['byline'] === null || article['byline'] === undefined) ? '' : (article['byline']['original'] || '')).replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\''),
    'abstract': (article['abstract'] === null ? (article['snippet'] || '') : article['abstract']).replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\'')
  };
};

var compareArticleSearchToMostPopular = function() {
  for(var article in mostPopular) {
    if(article in articleSearch) {
      if(mostPopular[article]['published_date'] === undefined) continue;
      
      var publishedDate = utils.correctDateInFuture(mostPopular[article]['published_date'], '-');
      var articleObject = createMostPopularArticle(article, publishedDate);

      if(results[publishedDate] === undefined) {
        results[publishedDate] = {
          'source': 'nyt',
          'children': [ articleObject ]
        };
      } else {
        results[publishedDate]['children'].push(articleObject);
      }
    }
  }
  return;
};

var prepareDataForResponse = function() {
  if(Object.keys(articleSearchDate).length !== 0) {
    var dates = Object.keys(articleSearchDate).sort(function(a, b) {
      var aDate = new Date(a);
      var bDate = new Date(b);
      return bDate - aDate;
    });

    var articles = articleSearchDate[dates[0]].concat((articleSearchDate[dates[1]] || []));

    for(var i = 0; i < articles.length; i++) {
      if(articles[i]['pub_date'] === undefined) continue;
      
      var publishedDate = utils.correctDateInFuture(articles[i]['pub_date'].substring(0, 10), '-');
      var img = getPictureArticleSearch(articles[i]);
      var articleObject = createArticleSearchArticle(articles[i], publishedDate, img);

      if(results[publishedDate] === undefined) {
        results[publishedDate] = {
          'source': 'nyt',
          'children': [ articleObject ]
        };
      } else {
        var existingArticles = results[publishedDate]['children'];
        
        for(var j = 0; j < existingArticles.length; j++) {
          if(articles[i]['web_url'] === existingArticles[j]['url']) {
            break;
          }
        }

        if(j === existingArticles.length) {
          results[publishedDate]['children'].push(articleObject);
        }
      }
    }
  }
  return;
};

module.exports = {

  'getArticles': function(req, res) {
    var searchTerm = req.body.searchTerm.replace(/\s/g, '+').toLowerCase();   // Remove spaces in searchTerm and replace with '+'
    if (searchTerm === 'immediahomepage') { searchTerm = 'news' }
    var days = req.body.days === undefined ? 7 : Number(req.body.days);

    // NYT Article Search parameters (note: CAN search by topic)
    var beginDate = utils.getDateFromToday(-days);
    var today = utils.getDateFromToday(0);
    var queryStringArticleSearch = articleSearchURI + 'q=' + searchTerm + '&fq=body:("' + searchTerm + '")&' + 'begin_date=' + beginDate + '&' + 'page=' + 0 + '&' + 'api-key=' + keys.nytArticleSearch;

    // Most-Popular NYT article parameters (note: cannot search by topic)
    var timePeriod = days;
    var queryStringMostPopular = mostPopularURI + timePeriod + '.json?api-key=' + keys.nytMostPopular;
    
    /*
    Create promise chain to search Most Popular articles and whether any
    articles for the given query match by the unique NYT website url
    */
    Q(queryStringArticleSearch)
      .then(request)  // GET request for FIRST PAGE of Article Search results
      .then(createArticleSearchMap.bind(null, searchTerm, beginDate))   // Calculates how many different GET requests are needed based on search term
      .all()
      .then(addArticlesToArticleSearch)
      .then(createMostPopularMap.bind(null, timePeriod)) // Send Most Popular GET request (20 results default)
      .all()
      .then(addArticlesToMostPopular)
      .then(compareArticleSearchToMostPopular)
      .then(prepareDataForResponse)
      .then(function() {
        res.send(results);
        articleSearch = {};
        articleSearchDate = {};
        mostPopular = {};
        results = {};
      })
      .done();
  }

};