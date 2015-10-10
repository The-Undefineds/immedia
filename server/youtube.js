var key = require('./keys.js');
var utils = require('./utils.js');
var request = require('request');

var youtube = 'https://www.googleapis.com/youtube/v3';

module.exports = {
  search : function(request, response) {
    var itemToSearch = request.body.searchTerm;

    if (itemToSearch === 'immediahomepage') {
      itemToSearch = '';
    }

    var date = request.body.date || 'this week'
    callYoutube(date, itemToSearch, function(status, data){
      response.status(status).send(data);
    });
  }
}

//To grab videos on a specific month just add publishedBefore and publishedAfter in the query

function callYoutube(date, item, callback){
  var search;
  if(item === ""){
    //used for popular searchs in any given day of a week
    var todayAndYesterday = utils.getDateTodayAndYesterday('-');
    var today = todayAndYesterday.today + 'T00:00:00Z';
    var yesterday = todayAndYesterday.yesterday + 'T00:00:00Z';
    console.log(today, yesterday) 

    search = {
      url : youtube + '/search', 
      qs : {part : 'snippet', type : 'video', videoEmbeddable : true, order: 'viewCount', publishedAfter: yesterday, publishedBefore: today, key : key.youtube},
      method : 'GET'
    }
  }else{
    search = {
      url : youtube + '/search',
      qs : {part : 'snippet', type : 'video', videoEmbeddable : true, q : item, key : key.youtube},
      method : 'GET'
    }
  }
  
  if (date === 'this week'){
    date = utils.getDateFromToday(-7,'-') + 'T00:00:00Z'
    search.qs.publishedAfter = date;
  }
  else if (date === 'this month'){
    date = utils.getDateFromToday(-30,'-') + 'T00:00:00Z'
    search.qs.publishedAfter = date;
  }  
  else if (date === 'this year'){
    date = utils.getDateFromToday(-365,'-') + 'T00:00:00Z'
    search.qs.publishedAfter = date;
  }
  
  request(search, function(error, response, body){
    if(error) {
      console.log(error);
      callback(404, error);
    } else {
      var videos = Array.prototype.slice.call(JSON.parse(body).items);
      var obj = {};
      //snippet.thumbnails.(key) | key = default|medium|high | access through key.url
      for (var i = 0; i < videos.length; i++){
        if(i === 3) break;
        var date = videos[i].snippet.publishedAt.slice(0, 10); //Should be user defined
        obj[date] = obj[date] || {
          source : 'youtube',
          children : []
        }
        obj[date].children.push({
          title : videos[i].snippet.title,
          id : videos[i].id.videoId,
          thumbnail : videos[i].snippet.thumbnails
        })        
      }
    }
    delete search.qs.publishedAfter;
    request(search, function(error, response, body){
      if(error) {
        console.log(error);
        callback(404, error);
      } else {
        body = JSON.parse(body);
        var date = body.items[0].snippet.publishedAt.slice(0, 10);
        obj[date] = obj[date] || {
          source : 'youtube',
          children : []
        }
        obj[date].children.push({
          title : body.items[i].snippet.title,
          id : body.items[i].id.videoId,
          thumbnail : body.items[i].snippet.thumbnails,
        })
        callback(200, obj);
      }
    })
  })
}