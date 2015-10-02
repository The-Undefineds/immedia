var React = require('react');

var frameCache = {};

var NytPreview = React.createClass({

  getInitialState: function () {
    return {
      rerender: false,
    }
  },
  
  resultsData: {},

  render: function() {

    component = this;
    
    var previewItem = this.props.previewItem;
    var preview = false;

    if (!frameCache[previewItem.url]) {
      var queryUrl = 'http://api.embed.ly/1/oembed?key=7fd3eb5aa6f34be7be07cb9015f01e23&url=' + previewItem.url;
      $.get(queryUrl, function(data) {
          frameCache[previewItem.url] = data;
          this.resultsData = data;
          this.resultsData.thumbnail_height = 0.45*this.resultsData.thumbnail_height;
          this.resultsData.thumbnail_width = 0.45*this.resultsData.thumbnail_width;
          component.setState({ rerender: !component.state.rerender })
      })
    } else {
      this.resultsData = frameCache[previewItem.url];
      preview = true;
    }



    return (
      <div>
        <h1>{ this.resultsData.title }</h1>
        <h3>{ this.resultsData.author_name }</h3>
        <img src={ this.resultsData.thumbnail_url } height={ this.resultsData.thumbnail_height } width= { this.resultsData.thumbnail_width }></img>
        <p>{ this.resultsData.description }</p>
      </div>
      );
  }


})

module.exports = NytPreview;