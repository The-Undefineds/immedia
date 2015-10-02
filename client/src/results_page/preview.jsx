var React = require('react');

var NytPreview = require('./nytpreview.jsx');

var player;

var Preview = React.createClass({

  mountYouTubeVideo: function(videoId){
    player = new YT.Player('preview', { // The 'player' refers to an id attached to an element
      height: '195',
      width: '320',
      videoId: videoId,
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
    var onPlayerReady = function(event) {
      event.target.playVideo();
    }
    var done = false;
    var onPlayerStateChange = function(event) {
      if (event.data == YT.PlayerState.PLAYING && !done) {
        setTimeout(stopVideo, 6000);done = true;
      }
    }
    var stopVideo = function() {
      player.stopVideo();
    }
    //To destroy the video
    //You have to destroy the video after using it
  },

  render: function() {

    var previewItem = this.props.previewItem;
    var source = previewItem.source;
      
    if (player) {
      player.destroy();
    }

    if (source == 'nyt') {
      var nyt = true;
    } else if (source == 'youtube') {
      this.mountYouTubeVideo(previewItem.id);
    } else if (source == 'twitter') {
      var twitter = true;
    }

    return(
      <div style={{float:'right'}}>
        { nyt ? <NytPreview previewItem={ previewItem } /> : null }
        { twitter ? <TwitterPreview previewItem={ previewItem } /> : null }
      </div>
      )
  }

});

module.exports = Preview;
