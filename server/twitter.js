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
    var queryString = request.body.searchTerm;
    
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
  search.qs = {user_id : id, include_rts : 'false'};
  search.headers.Authorization = OAuth(newUrl, 'user_id=' + id, 'include_rts=false');
  request(search, function(error, response, body){
    if(error) {
      callback(404, error);
    } else {
      body = JSON.parse(body);
       if (body[0]) {
         var arr = [];
         var date = body[0].created_at;
         var month = date.slice(4, 7);
         var year = date.slice(26);
         var day = date.slice(8,10);
         date = year + '-' + month + '-' + day
         
         for (var i = 0; i < 3; i++){
          arr.push(body[i]["id_str"]);
         }
         embedTweet(url, arr, callback, date);
       }
       else callback(200, body);
    }
  })
}

function embedTweet(url, arr, callback, date){
  var obj = {};
  var manualPromise = 0;
  obj[date] = {
    source : 'twitter',
    children : []
  }
  
  search.url = url;
  search.headers.Authorization = null;
  
  for (var i = 0; i < arr.length; i++){
    search.qs = {id : arr[i]};
    request(search, function(error, response, body){
      if(error) {
        callback(404, error);
      } else {
        body = JSON.parse(body);
        obj[date].children.push({
          url : body.url,
          tweet : body.html
        })
        manualPromise++;
        if (manualPromise === 3) callback(200, obj);
      }
    })
  }
}