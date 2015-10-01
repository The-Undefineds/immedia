var OAuth = require('./OAuth');
var request = require('request');

var baseUrl = 'https://api.twitter.com/1.1/users/search.json';
var newUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
var url = 'https://api.twitter.com/1/statuses/oembed.json';

var search = {
  url : '',
  qs : {},
  method : 'GET',
  headers: {
    Authorization : ''
  }
}

module.exports = {
  getTweetsPerson : function(request, response){
    var queryString = 'Donald Trump'; //request.body.searchTerm
    
    findUser(baseUrl, queryString, function(status, data){
      response.status(status).send(data);
    });
  }
}

function findUser(baseUrl, queryString, callback){
  search.url = baseUrl;
  search.qs = {q : queryString};
  search.headers.Authorization = OAuth(baseUrl, 'q=' + queryString);
  request(search, function(error, response, body){
    if(error) {
      callback(404, error);
    } else {
      body = JSON.parse(body);
      var id;
      if (body instanceof Array) { 
        id = body[0].id;
        grabTimeline(newUrl, id, callback);
      }
      else {
        callback(200, body);
      }
    }
  })
}

function grabTimeline(newUrl, id, callback){
  search.url = newUrl;
  search.qs = {user_id : id};
  search.headers.Authorization = OAuth(newUrl, 'user_id=' + id);
  request(search, function(error, response, body){
    if(error) {
      callback(404, error);
    } else {
      body = JSON.parse(body);
      if (body[0]) {
        embedTweet(url, body[0]["id_str"], callback);
      }
      else 
        callback(200, body);
    }
  })
}

function embedTweet(url, id, callback){
  console.log(id);
  search.url = url;
  search.qs = {id : id};
  search.headers.Authorization = null;
  request(search, function(error, response, body){
    if(error) {
      callback(404, error);
    } else {
      body = JSON.parse(body);
      callback(200, body.html);
    }
  })
}