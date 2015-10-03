var React = require('react');

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
}(document, "script", "twitter-wjs"))


var TwitterPreview = React.createClass({

  componentDidMount: function() {
    var tweetId = this.props.previewItem.url.slice(this.props.previewItem.url.length - 18, this.props.previewItem.url.length);

    $('<div id="tweet"></div>').hide().prependTo('#twitterPreview').fadeIn(800);
    twttr.widgets.createTweet(
      tweetId,
      document.getElementById('tweet')
      )
},

  componentDidUpdate: function() {
    
    $('#twitterPreview').empty();

    var tweetId = this.props.previewItem.url.slice(this.props.previewItem.url.length - 18, this.props.previewItem.url.length);

    $('<div id="tweet"></div>').hide().prependTo('#twitterPreview').fadeIn(800);
    twttr.widgets.createTweet(
      tweetId,
      document.getElementById('tweet')
      )
  },

  render: function() {

    return (
      <div id='twitterPreview'></div>
      )

  }

});

module.exports = TwitterPreview;