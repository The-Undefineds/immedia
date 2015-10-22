/*
    file: youtube.js
    - - - - - - - - - - - -
    YouTube middleware that sends a GET request to
    YouTube's v3 API for the most relevant uploaded
    videos on a subject in the last month.
 */

// Required node modules
var request = require('request');

var keys = require('./keys.js');    // API keys file with YouTube API key
var utils = require('./utils.js');  // Date helper functions

var youtubeAPIUrl = 'https://www.googleapis.com/youtube/v3';
var numVideosToReturn = 3;
var numHTTPRequests = 5;
var requestCount;
var obj;
var videoIds;

module.exports = {
  search : function(request, response) {
    var itemToSearch = request.body.searchTerm.toLowerCase();

    /*
        If user is at the homepage, get most popular
        videos over time period.
     */
    if (itemToSearch === 'immediahomepage') {
      itemToSearch = '';
    }

    // Start async callback chain
    callYoutube(itemToSearch, function(status, data){
      response.status(status).send(data);
    });
  }
}


//Set the queries to be used in GET request
function callYoutube(item, callback){
  var search = {
    url : youtubeAPIUrl + '/search',
    method : 'GET',
    qs: {
          part : 'snippet',
          type : 'video',
          videoEmbeddable : true,
          key : keys.youtube
        }
  };
  requestCount = 0;
  obj = {};
  videoIds = {};
  
  if(item === ''){
    // Search for most popular videos at homepage
    search.qs.order = 'viewCount';
  } else {
    // Otherwise search for query's most popular videos
    search.qs.q = item;
  }

  // Get the dates corresponding to the last four weeks
  var date = [];
  date.push(utils.getDateFromToday(-6,'-') + 'T00:00:00Z');
  date.push(utils.getDateFromToday(-13,'-') + 'T00:00:00Z'); 
  date.push(utils.getDateFromToday(-20,'-') + 'T00:00:00Z');
  date.push(utils.getDateFromToday(-27,'-') + 'T00:00:00Z');
  
  // Send request to YouTube for each week of videos
  for (var i = 0; i < date.length; i++){
    search.qs.publishedAfter = date[i];
    if (i > 0) search.qs.publishedBefore = date[i - 1];
    requestWeek(search, callback);
  }

  //Deletes 2 queries to gather a video published any time
  delete search.qs.publishedAfter;
  delete search.qs.publishedBefore;
  requestAllTime(search, callback);
}

/*
    Send request to Youtube with the given parameters stored
    as an object in the argument `search`
 */
function requestWeek(search, callback){
  request(search, function(error, response, body){
    if(error) {
      console.log(error);
      callback(404, error);
      return;
    }
    
    var videos = Array.prototype.slice.call(JSON.parse(body).items);
      
    for (var i = 0; i < numVideosToReturn; i++) performOperation(videos[i], callback);
    waitForRequestsToReturn(callback);
  });
}

// Send request to Youtube for most popular video all-time
function requestAllTime(search, callback){
  request(search, function(error, response, body){
    if(error) {
      console.log(error);
      callback(404, error);
    } else {
      body = JSON.parse(body);
      
      //Gather the first video
      performOperation(body.items[0], callback);
      waitForRequestsToReturn(callback);
    }
  })
}

/*
    Ensure most popular video is not also included
    in popular videos for the month
 */
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

/* 
    Sends response only once requests for most popular videos
    from the month and all-time return
 */
function waitForRequestsToReturn(callback){
  requestCount++;
  if (requestCount === numHTTPRequests) callback(200, obj);
}