var React = require('react');

var TwitterPreview = React.createClass({

  componentDidMount: function() {
    
    $('<div class="tweet">' + this.props.previewItem.tweet + '</div>').hide().prependTo($('#twitterPreview')).fadeIn(600);
    
  },

  componentDidUpdate: function() {
    
    $('#twitterPreview').empty();

    $('<div class="tweet">' + this.props.previewItem.tweet + '</div>').hide().prependTo($('#twitterPreview')).fadeIn(600);

  },

  render: function() {

    return (
      <div id='twitterPreview'></div>
      )

  }

});

module.exports = TwitterPreview;
