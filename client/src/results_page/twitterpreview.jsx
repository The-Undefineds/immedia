var React = require('react');
var StyleSheet = require('react-style');


var styles = StyleSheet.create({
  preview: {
    top: '40px',
    paddingRight: '5px',
    position: 'absolute',
    overflow: 'scroll',
  },
});

var TwitterPreview = React.createClass({

  getInitialState: function() {
    return {
      width: this.props.window.width,
      height: this.props.window.height,
    }
  },

  componentWillMount: function() {
    /*
      This is code supplied by the Twitter API documentation
      Exposes several methods, including .createTweet, which can be used to embed tweets asynchronously
      based on the tweet ID alone.
    */

    window.twttr = (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0],
          t = window.twttr || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);

      t._e = [];
      t.ready = function(f) {
        t._e.push(f);
      };

      return t;
    }(document, "script", "twitter-wjs"));
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      width: nextProps.window.width,
      height: nextProps.window.height,
    });
  },

  componentDidMount: function() {
    this.embedTweet(this.props.previewItem.tweetId);
  },

  componentDidUpdate: function(prevProps, prevState) {
    //Empties the current contents of the preview window and embeds a new tweet that has been
    //moused over in the D3 timeline.
    if(prevProps.previewItem !== this.props.previewItem) {
      $('#previewTwitter').empty();
      this.embedTweet(this.props.previewItem.tweetId);
    }
  },

  render: function() {
    this.getDynamicStyles();

    return (
      <div id='previewTwitter' style={styles.preview}></div>
    );
  },

  getDynamicStyles: function() {
    styles.preview.width = (this.state.width - 1350 < 0 ? 500 * (this.state.width/1350) : 500) + 'px';
    styles.preview.height = this.state.height - 100 + 'px';
  },

  embedTweet: function(tweetId) {

    //A new div with id "tweet" is created, and the embedded tweet is appended to it.
    $('<div id="tweet"></div>').hide().prependTo('#previewTwitter').fadeIn(800);
    twttr.ready(function(twttr) {
      twttr.widgets.createTweet(
        tweetId,
        document.getElementById('tweet')
      );
    });
  },
});

module.exports = TwitterPreview;
