var React = require('react');

var YouTubePreview = React.createClass({

  getInitialState: function() {
    return {
      width: this.props.width,
      height: this.props.height,
    };
  },

  componentDidMount: function() {
    this.mountYouTubeVideo(this.props.previewItem.id);
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      width: nextProps.width,
      height: nextProps.height,
    });
  },

  componentWillUpdate: function() {
    var $youtube = $('#youtube');
    if($youtube[0].localName === 'iframe') {
      $youtube.replaceWith('<div id=\"youtube\"></div>');
    }
  },

  componentDidUpdate: function() {
    this.mountYouTubeVideo(this.props.previewItem.id);
  },

  render: function() {
    return (
      <div id="youtube"></div>
    );
  },

  mountYouTubeVideo: function(videoId){
    var player = new YT.Player('youtube', { // The 'player' refers to an id attached to an element
      height: this.state.height,
      width: this.state.width,
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