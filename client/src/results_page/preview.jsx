var React = require('react');

var NytPreview = require('./nytpreview.jsx');
var TwitterPreview = require('./twitterpreview.jsx');

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
  },

  render: function() {

    var previewItem = this.props.previewItem;
    var source = previewItem.source;
    console.log(previewItem);

    if (previewItem.tweet) {
      var twitter = true;
    } else if (source == 'nyt') {
      var nyt = true;
    } else if (source == 'youtube') {
      this.mountYouTubeVideo(previewItem.id);
    } else if (source == 'twitter') {
      var twitter = true;
    }

    return (
      <div>
        { nyt ? <NytPreview previewItem={ previewItem } /> : null }
        { twitter ? <TwitterPreview previewItem={ previewItem } /> : null }
      </div>
      )
  }
});

module.exports = Preview;
