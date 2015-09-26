var request = require('request');

var youtube = 'https://www.googleapis.com/youtube/v3';

module.exports = function(itemToSearch, callback){
  var search = {
    url : youtube + '/search',
    qs : {part : 'snippet', type : 'video', q : 'just do it!', key : 'AIzaSyAGBNXHZthCIWxva4mtnG1TU_Yo0za5xKk'},
    method : 'GET'
  }
  
  request(search, function(error, response, body){
    if(error) {
      console.log(error);
      callback(error);
    } else {
      body = JSON.parse(body);
      callback("<div id='player'></div><script>var tag = document.createElement('script');tag.src = 'https://www.youtube.com/iframe_api';var firstScriptTag = document.getElementsByTagName('script')[0];firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);var player;function onYouTubeIframeAPIReady() {player = new YT.Player('player', {height: '390',width: '640',videoId: '" + body.items[0].id.videoId + "',events: {'onReady': onPlayerReady,'onStateChange': onPlayerStateChange}});}function onPlayerReady(event) {event.target.playVideo();}var done = false;function onPlayerStateChange(event) {if (event.data == YT.PlayerState.PLAYING && !done) {setTimeout(stopVideo, 6000);done = true;}}function stopVideo() {player.stopVideo();}</script>");
    }
  })
}