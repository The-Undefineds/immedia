var React = require('react');

//This is code supplied by the Twitter API documentation
//Exposes several methods, including .createTweet, which can be used to embed tweets asynchronously
//based on the tweet ID alone.
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

    //A new div with id "tweet" is created, and the embedded tweet is appended to it.
    $('<div id="tweet"></div>').hide().prependTo('#twitterPreview').fadeIn(800);
      twttr.widgets.createTweet(
        tweetId,
        document.getElementById('tweet')
        ).then(function(element) {
          console.log(element);
        })
  },

  componentDidMount: function() {
    this.componentDidUpdate();
},

  componentDidUpdate: function() {
    //Empties the current contents of the preview window and embeds a new tweet that has been
    //moused over in the D3 timeline.
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