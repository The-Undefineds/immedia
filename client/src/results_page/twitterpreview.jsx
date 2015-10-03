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

    $('<div id="tweet">' + this.props.previewItem.tweet + '</div>').prependTo($('#twitterPreview')).fadeIn(400);  
    
    twttr.widgets.load(
      document.getElementById('twitterPreview')
    );
  },

  componentDidUpdate: function() {
    
    $('#twitterPreview').empty();

    $('<div id="tweet">' + this.props.previewItem.tweet + '</div>').prependTo($('#twitterPreview')).fadeIn(400);  
    
    twttr.widgets.load(
      document.getElementById('twitterPreview')
    );
  },

  render: function() {

    return (
      <div id='twitterPreview'></div>
      )

  }

});

module.exports = TwitterPreview;
// 650003054201339904