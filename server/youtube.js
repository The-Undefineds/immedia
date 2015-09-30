var key = require('./keys');
var utils = require('./utils.js');
var request = require('request');

var youtube = 'https://www.googleapis.com/youtube/v3';

module.exports = {
  search : function(request, response) {
    var itemToSearch = request.body.searchTerm;
    callYoutube(utils.getDateFromToday(-7,'-') + 'T00:00:00Z', itemToSearch, function(status, data){
      response.status(status).send(data);
    });
  }
}

//To grab videos on a specific month just add publishedBefore and publishedAfter in the query

function callYoutube(date, item, callback){
  var search = {
    url : youtube + '/search',
    qs : {part : 'snippet', type : 'video', videoEmbeddable : true, q : item, key : key.youtube},
    method : 'GET'
  }
  
  request(search, function(error, response, body){
    if(error) {
      console.log(error);
      callback(404, error);
    } else {
      body = JSON.parse(body);
      
      //snippet.thumbnails.(key) | key = default|medium|high | access through key.url
      var date = body.items[0].snippet.publishedAt.slice(0, 10); //Should be user defined
         
      var obj = {};
      obj[date] = {
        source : 'youtube',
        children : []
      }
      
      for (var i = 0; i < body.items.length && obj[date].children.length <= 5; i++){
        if (body.items[i].snippet.publishedAt.slice(0, 10) === date){
          obj[date].children.push({
            title : body.items[i].snippet.title,
            id : body.items[i].id.videoId,
            thumbnail : body.items[i].snippet.thumbnails
          })
        }
      }
      
      callback(200, obj);
    }
  })
}