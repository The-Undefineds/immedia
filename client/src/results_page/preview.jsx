var React = require('react');

var NytPreview = require('./nytpreview.jsx');

var Preview = React.createClass({

  render: function() {

    var previewItem = this.props.previewItem;
    var source = previewItem.source;
    
    if (source == 'nyt') {
      var nyt = true;
    } else if (source == 'youtube') {
      var youtube = true;
    } else if (source == 'twitter') {
      var twitter = true;
    }
    
    return(
      <div>

      { nyt ? <NytPreview previewItem={ previewItem } /> : null }
      { twitter ? <TwitterPreview previewItem={ previewItem } /> : null }
      { youtube ? <YouTubePreview previewItem={ previewItem } /> : null }

      </div>
      )
  }

});

module.exports = Preview;
