var React = require('react');

var YouTubePreview = React.createClass({

  getInitialState: function() {
    return {
      width: this.props.window.width,
      height: this.props.window.height,
    };
  },

  componentDidMount: function() {
    this.mountYouTubeVideo(this.props.previewItem.videoId);
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      width: nextProps.window.width,
      height: nextProps.window.height,
    });
  },

  componentWillUpdate: function() {
    var $youtube = $('#youtube');
    if($youtube[0].localName === 'iframe') {
      $youtube.replaceWith('<div id=\"youtube\"></div>');
    }
  },

  componentDidUpdate: function() {
    this.mountYouTubeVideo(this.props.previewItem.videoId);
  },

  render: function() {
    return (
      <div id="youtube"></div>
    );
  },

  mountYouTubeVideo: function(videoId){
    var width = (this.state.width - 1350 < 0 ? 500 * (this.state.width/1350) : 500);
    var height = this.state.height - 100 - 5;

    var player = new YT.Player('youtube', { // The 'player' refers to an id attached to an element
      height: height,
      width: width,
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
        setTimeout(stopVideo, 6000);
        done = true;
      }
    }
    var stopVideo = function() {
      player.stopVideo();
    }
  },

});

module.exports = YouTubePreview;