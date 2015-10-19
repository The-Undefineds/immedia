var key = require('./keys.js');
var utils = require('./utils.js');
var request = require('request');

var youtube = 'https://www.googleapis.com/youtube/v3';
var requestCount;
var obj;
var videoIds;

module.exports = {
  search : function(request, response) {
    var itemToSearch = request.body.searchTerm.toLowerCase();

    if (itemToSearch === 'immediahomepage') {
      itemToSearch = '';
    }

    callYoutube(itemToSearch, function(status, data){
      response.status(status).send(data);
    });
  }
}

function callYoutube(item, callback){
  var search;
  requestCount = 0;
  obj = {};
  videoIds = {};
  
  //Set the queries to be used in GET request
  if(item === ""){
    //used for popular searchs in any given week
    search = {
      url : youtube + '/search', 
      qs : {part : 'snippet', type : 'video', videoEmbeddable : true, order: 'viewCount', key : key.youtube},
      method : 'GET'
    }
  }else{
    search = {
      url : youtube + '/search',
      qs : {part : 'snippet', type : 'video', videoEmbeddable : true, q : item, key : key.youtube},
      method : 'GET'
    }
  }
  //Determine the dates of youtube videos to gather
  //4 dates, each represents a week
  var date = [];
  date.push(utils.getDateFromToday(-6,'-') + 'T00:00:00Z');
  date.push(utils.getDateFromToday(-13,'-') + 'T00:00:00Z'); 
  date.push(utils.getDateFromToday(-20,'-') + 'T00:00:00Z');
  date.push(utils.getDateFromToday(-27,'-') + 'T00:00:00Z');
  
  for (var i = 0; i < 4; i++){
    search.qs.publishedAfter = date[i];
    if (i > 0) search.qs.publishedBefore = date[i - 1];
    requestWeek(search, callback);
  }
  //Deletes 2 queries to gather a video published any time
   delete search.qs.publishedAfter;
   delete search.qs.publishedBefore;
   requestAllTime(search, callback);
}

function requestWeek(search, callback){
  request(search, function(error, response, body){
    if(error) {
      console.log(error);
      callback(404, error);
    } else {
      var videos = Array.prototype.slice.call(JSON.parse(body).items);
      
      //Gather 3 videos
      for (var i = 0; i < 3; i++) performOperation(videos[i], callback);
      async(callback);
    }
  })
}

function requestAllTime(search, callback){
  request(search, function(error, response, body){
    if(error) {
      console.log(error);
      callback(404, error);
    } else {
      body = JSON.parse(body);
      
      //Gather the first video
      performOperation(body.items[0], callback);
      async(callback);
    }
  })
}

function performOperation(video, callback){
  if (!(video.id.videoId in videoIds)){ //Checks the videoIds if it already contains this specific video
    videoIds[video.id.videoId] = true;
    var date = video.snippet.publishedAt.slice(0, 10);
    
    obj[date] = obj[date] || {
      source : 'youtube',
      children : []
    }
    
    obj[date].children.push({
      title : video.snippet.title,
      videoId : video.id.videoId,
      thumbnail : video.snippet.thumbnails //snippet.thumbnails.(key) | key = default|medium|high | access through key.url
    })
  }
}

function async(callback){
  //Handles async
  //Once requestCount hits 5, that's the only time we will send back a response to the client
  requestCount++;
  if (requestCount === 5) callback(200, obj);
}