/*
    nyt.js
    - - - - - - - - - - - -
    New York Times middleware invoked when request is sent to /api/nyt endpoint
    that kicks off a promise chain sending up to 11 GET requests
    to NYT's Article Search V2 and Most Popular APIs. Since only
    the NYT Article Search API is queryable, we need to manually cross-check
    articles from both APIs by their URL to ensure the most popular articles
    are returned to the immedia timeline.

    Unfortunately API fields are not consistent across NYTs' APIs (web_url vs. url, etc.).
    As such, it was simpler to create helper functions unique to one API even
    though similar logic is employed.
 */

// Required node modules
var Q = require('q');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var FuzzySet = require('fuzzyset.js');    // Used for calculating Levenshtein distance of strings (similarity)

var keys = require('./keys.js');    // API keys file with YouTube API key
var utils = require('./utils.js');  // Date helper functions

var articleSearchURI = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?';
var mostPopularURI = 'http://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/';
var articleSearch = {};
var articleSearchDate = {};
var mostPopular = {};
var results = {};


module.exports = {

  'getArticles': function(req, res) {
    var searchTerm = req.body.searchTerm;
    var days = req.body.days === undefined ? 7 : Number(req.body.days);
    
    // If user is on homepage, only send request for most popular articles (non-queryable)
    if(searchTerm === 'immediahomepage') {
      getMostPopularArticles(res, days);
      return;
    }

    // Otherwise, complete both recent and most popular requests, cross-checking results
    getRecentAndMostPopularArticles(res, searchTerm, days)
    return;
  }

};

/*
    Promise chain that returns a max number of the most popular
    articles for the given number of days passed as an argument.
    A single request to NYT's Most Popular API only returns 20 results,
    so multiple requests are needed depending on the desired number
    of articles to be returned.
 */
function getMostPopularArticles(res, days) {
  Q()
    .then(createMostPopularMap.bind(null, days))
    .all()
    .then(addArticlesToMostPopular)
    .then(prepareMostPopularForResponse)
    .then(function(results) {
      res.send(results);
    })
    .then(function() {
      mostPopular = {};
    })
    .done();
  return;
}

/*
    Promise chain that returns the recent and most popular articles
    for a search term and number of days passed as arguments. As mentioned above,
    NYT's Most Popular API cannot be queried by topic, so a manual cross-check
    is required to compare the results of the Article Search API. Furthermore, both
    APIs are rate-limited, with the Article Search and Most Popular APIs returning at
    most 10 and 20 articles, respectively, for each request. As such, multiple async
    requests are needed for a comprehensive return.
 */
function getRecentAndMostPopularArticles(res, searchTerm, days) {
  // NYT Article Search parameters (note: CAN search by topic)
  var beginDate = utils.getDateFromToday(-days);
  var today = utils.getDateFromToday(0);
  var queryStringArticleSearch = articleSearchURI + 'q="' + searchTerm + '"&fq=source:"The New York Times"&begin_date=' + beginDate + '&' + 'sort=newest&page=' + 0 + '&' + 'api-key=' + keys.nytArticleSearch;

  Q(queryStringArticleSearch)
    .then(request)  // GET request for FIRST PAGE of Article Search results
    .then(createArticleSearchMap.bind(null, searchTerm, beginDate))   // Calculate how many different GET requests are needed based on search term
    .all()
    .then(addArticlesToArticleSearch.bind(null, searchTerm))    // Add articles from Article Search API to hash table
    .then(createMostPopularMap.bind(null, days))    // Send Most Popular GET requests
    .all()
    .then(addArticlesToMostPopular)     // Add articles from Most Popular API to hashtable
    .then(compareArticleSearchToMostPopular)    // Cross-check articles from different endpoints
    .then(prepareDataForResponse)     // Prepare data in format required for front-end rendering
    .then(function() {
      res.send(results);
    })
    .then(function(){
      articleSearch = {};
      articleSearchDate = {};
      mostPopular = {};
      results = {};
    })
    .done();

  return;
}

/*
    Helper function to find pictures of optimal viewing
    size specifically for NYT's Article Search API. Because
    article pictures are nested well within a response and can have
    any of five sizes, we need to ensure the right one
    is returned to the front-end for previewing.
 */
function getPictureArticleSearch(article) {
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

/*
    Each NYT Article Search article object is classified under
    certain keywords by the NYT. The classifications are often
    far superior than the standard results received by passing a
    query string to the NYT's standard query or filter query parameters.

    Since the NYT keyword classifications can be highly specific,
    we employ a Levenshtein distance calculation to determine if our
    given immedia query string, which tends to be more general,
    is similar to the keyword classification
    (ie. Clinton, Hillary Rodham matches Clinton, Hillary)

    The keyword classification also takes the form `Last, First Middle Initial`
    for people, so a regular expression is used to manipulate
    names from the `First Last` structure.
 */
function searchTermListedAsKeyword(article, searchTerm) {
  if(article['keywords'] === undefined) return false;

  // Regex that converts human names from `First Last` to `Last, First` for use with NYT Keyword search
  var personTerm = searchTerm.replace(/^(.+?) ([^\s,]+)(,? (?:[JS]r\.?|III?|IV))?$/i,"$2, $1$3");
  var keywords = Array.prototype.slice.call(article['keywords']);
  var similarityThreshold = 0.5;
  
  for(var i = 0; i < keywords.length; i++) {
    var keyword = keywords[i]['value'];
    if(!keyword) continue;

    // Levenshtein distance calculation
    var keywordCheck = FuzzySet([keyword]);
    var searchCheck = keywordCheck.get(searchTerm);
    var personCheck = keywordCheck.get(personTerm);

    if( (searchCheck !== null && searchCheck[0][0] > similarityThreshold) || 
        (personCheck !== null && personCheck[0][0] > similarityThreshold)) {
      return true;
    }
  }
  return false;
};

/*
    Function that adds article specific to the NYT Article Search API
    to a hash table so that the results can be compared to those
    results from the Most Popular API requests' results.
 */
function addArticleToArticleSearchDate(article) {
  var publishedDate = utils.correctDateInFuture(article['pub_date'].substring(0, 10), '-');
  
  if(articleSearchDate[publishedDate] === undefined) {
    articleSearchDate[publishedDate] = [ article ];
  } else {
    articleSearchDate[publishedDate].push( article );
  }
};

/*
    Since a given search term can have any number of articles,
    and NYT's Article Search API only returns 10 results at a time,
    a map of async calls needs to be created in order to get the
    majority of articles.
 */
function createArticleSearchMap(searchTerm, beginDate, response) {
  if(JSON.parse(response['1'])['status'] === 'ERROR') {
    return [];
  }

  var numArticlesPerRequest = 10;
  var body = JSON.parse(response['1']).response;    // Parse request body
  var articles = Array.prototype.slice.call(body.docs);   // Article objects for FIRST PAGE of Article Search results
  var numArticles = body.meta.hits;   // Overall number of articles for search query
  var numRequests = Math.ceil(numArticles / numArticlesPerRequest) > numArticlesPerRequest ? numArticlesPerRequest : Math.ceil(numArticles / numArticlesPerRequest);    // Number of GET requests required to match all articles, NYT API request limit per second is 10
  var getRequestURIs = [];

  // Store results of first Article Search request
  for(var j = 0; j < articles.length; j++) {
    if(searchTermListedAsKeyword(articles[j], searchTerm)) {
      articleSearch[articles[j]['web_url']] = articles[j];  // Maintain object to track articles by NYT web url key
      addArticleToArticleSearchDate(articles[j]);           // Maintain object to track articles by date so to get the most recent
    }
  }

  // Create async map of requests
  for(var i = 1; i < numRequests ; i++) {
    var queryString = articleSearchURI + 'q="' + searchTerm + '"&fq=source:"The New York Times"&begin_date=' + beginDate + '&' + 'sort=newest&page=' + i + '&' + 'api-key=' + keys.nytArticleSearch;
    
    getRequestURIs.push(    // Create an array to carry-out parallel async requests
      request(queryString)
    );
  }
  return getRequestURIs;
};

/*
    Helper function that creates a map of async requests
    to NYT's Most Popular API since only 20 articles can
    be returned in a single request.
 */
function createMostPopularMap(timePeriod) {
  var numArticlesMax = 100;
  var numArticlesPerRequest = 20;
  var getRequestURIs = [];
  
  for(var i = 0; i < numArticlesMax; i += numArticlesPerRequest) {
    var queryString = mostPopularURI + timePeriod + '.json?offset=' + i + '&api-key=' + keys.nytMostPopular;
    
    getRequestURIs.push(
      request(queryString)
    );
  }
  return getRequestURIs;
};

/*
    Helper function that adds articles contained in each of 
    the responses from the map of Article Search API requests
    to a hash table in order to compare with Most Popular API results.
 */
function addArticlesToArticleSearch(searchTerm, responses) {
  for(var i = 0; i < responses.length; i++) {
    if(JSON.parse(responses[i]['1'])['status'] === 'ERROR') continue;
    
    var articles = Array.prototype.slice.call(JSON.parse(responses[i]['1']).response.docs);
    for(var j = 0; j < articles.length; j++) {
      if(searchTermListedAsKeyword(articles[j], searchTerm)) {
        articleSearch[articles[j]['web_url']] = articles[j];
        addArticleToArticleSearchDate(articles[j]);
      }
    }
  }
  return;
};

/*
    Helper function that adds articles contained in each of
    the responses from the map of Most Popular API requests
    to a hash table in order to compare with Article Search API results.
 */
function addArticlesToMostPopular(responses) {
  for(var i = 0; i < responses.length; i++) {  
    if(!responses[i]['1']) continue;
    var articles = Array.prototype.slice.call(JSON.parse(responses[i]['1']).results);
    for(var j = 0; j < articles.length; j++) {
      mostPopular[articles[j]['url']] = articles[j];
    }
  }
  return;
};

/*
    Since the immedia front-end requires certain attributes of each NYT article,
    and each NYT API stores information about each article differently,
    different helper functions exist to package an article appropriately --
    this one is for the Most Popular API.
 */
function createMostPopularArticle(article, date) {
  return {
    'title': mostPopular[article]['title'].replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\'').replace(/&#8212;/g, '-').replace(/&#038;/g, '&'),
    'url': mostPopular[article]['url'],
    'img': (mostPopular[article]['media']['0'] === undefined ? '' : mostPopular[article]['media']['0']['media-metadata']['0']['url']),
    'height': (mostPopular[article]['media']['0'] === undefined ? '' : mostPopular[article]['media']['0']['media-metadata']['0']['height']),
    'width': (mostPopular[article]['media']['0'] === undefined ? '' : mostPopular[article]['media']['0']['media-metadata']['0']['width']),
    'date': date,
    'byline': (mostPopular[article]['byline'] || '').replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\'').replace(/&#8212;/g, '-').replace(/&#038;/g, '&'),
    'abstract': (mostPopular[article]['abstract'] || '').replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\'').replace(/&#8212;/g, '-').replace(/&#038;/g, '&')
  };
};

/*
    Since the immedia front-end requires certain attributes of each NYT article,
    and each NYT API stores information about each article differently,
    different helper functions exist to package an article appropriately --
    this one is for the Article Search API.
 */
function createArticleSearchArticle(article, date, img) {
  return {
    'title': article['headline']['main'].replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\'').replace(/&#8212;/g, '-').replace(/&#038;/g, '&'),
    'url': article['web_url'],
    'img': (img === undefined ? '' : img['url']),
    'height': (img === undefined ? '' : img['height']),
    'width': (img === undefined ? '' : img['width']),
    'date': date,
    'byline': ((article['byline'] === null || article['byline'] === undefined) ? '' : (article['byline']['original'] || '')).replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\'').replace(/&#8212;/g, '-').replace(/&#038;/g, '&'),
    'abstract': (article['abstract'] === null ? (article['snippet'] || '') : article['abstract']).replace(/&#8217;/g, '\'').replace(/&#8216;/g, '\'').replace(/&#8212;/g, '-').replace(/&#038;/g, '&')
  };
};

/*
    Helper function that carries out a manual cross-check of each
    Most Popular article to see if it is contained in the results
    from the Article Search API.
 */
function compareArticleSearchToMostPopular() {
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

/*
    Helper function that adds the most recent articles
    particular to the given query string from the
    Article Search results.
 */
function prepareDataForResponse() {
  // Checks if articles exist for the given query string
  if(Object.keys(articleSearchDate).length !== 0) {
    
    /* 
        Sorts articles stored in the Article Search hash table with keys
        corresponding to the article publish date to get the most recent days'
        articles.
     */
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

/*
    Helper function to determine the number of most popular articles
    to send back to the immedia homepage
 */
function prepareMostPopularForResponse() {
  var numArticlesMax = 15;
  var numArticlesByDayMax = 3;
  var numArticles = 0;
  var result = {};

  for(article in mostPopular) {
    var date = mostPopular[article]['published_date'];
    var articleObject = createMostPopularArticle(article, date);
    result[date] = result[date] || { 'source': 'nyt', 'children': [] };

    if(result[date]['children'].length < numArticlesByDayMax) {
      result[date]['children'].push(articleObject);
      numArticles++;
    }

    if(numArticles === numArticlesMax) break;
  }
  return result;  
};
