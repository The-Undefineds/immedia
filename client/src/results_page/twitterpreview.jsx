var React = require('react');

var renderCount = 0;

var TwitterPreview = React.createClass({

  componentDidMount: function() {
    
    $('<div class="tweet">' + this.props.previewItem.tweet + '</div>').hide().prependTo($('#twitterPreview')).fadeIn(600);
    
    renderCount++;
  },

  componentDidUpdate: function() {
    
    if (renderCount === 3) {
      $('#twitterPreview').empty();
      renderCount = 0;
    }

    $('<div class="tweet">' + this.props.previewItem.tweet + '</div>').hide().prependTo($('#twitterPreview')).fadeIn(600);
  
    renderCount++;

  },

  render: function() {

    return (
      <div id='twitterPreview'></div>
      )

  }

});

module.exports = TwitterPreview;
