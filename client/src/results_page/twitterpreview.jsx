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
}(document, "script", "twitter-wjs"));


var TwitterPreview = React.createClass({

  embedTweet: function(tweetId) {

    $('<div id="tweet"></div>').hide().prependTo('#twitterPreview').fadeIn(800);
      twttr.widgets.createTweet(
        tweetId,
        document.getElementById('tweet')
        )
  },

  componentDidMount: function() {
    this.componentDidUpdate();
},

  componentDidUpdate: function() {
    $('#twitterPreview').empty();
    var twitterItem = this.props.previewItem;
    this.embedTweet(twitterItem.tweetId);
  },

  render: function() {
    return (
      <div id='twitterPreview'></div>
      )

  }

});

module.exports = TwitterPreview;