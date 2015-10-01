var React = require('react');

var frameCache = {};

var NytPreview = React.createClass({
  
  render: function() {
    
    var previewItem = this.props.previewItem;
    var preview = false;

    var previewData;

    if (!frameCache[previewItem.url]) {
      $.ajax({
        type: 'GET',
        url: 'http://api.embed.ly/1/oembed?key=7fd3eb5aa6f34be7be07cb9015f01e23&url=' + previewItem.url,
        dataType: 'jsonp',
        success: function(data) {
          console.log('success!', data);
          frameCache[previewItem.url] = data;
          previewData = data;
          previewData.thumbnail_height = 0.45*previewData.thumbnail_height;
          previewData.thumbnail_width = 0.45*previewData.thumbnail_width;
          preview = true;
        },
        failure: function(data) {
          console.log('whateva');
        }
      })
    } else {
      console.log('cached data:', frameCache[previewItem.url]);
      previewData = frameCache[previewItem.url];
      preview = true;
    }



    return (
      <div>
       { preview ? <div><h1>{ previewData.title }</h1>
        <h3>{ previewData.author_name }</h3>
        <img src={ previewData.thumbnail_url } height={ previewData.thumbnail_height } width= { previewData.thumbnail_width }></img>
        <p>{ previewData.description }</p></div> : null }
      </div>
      );
  }


})

module.exports = NytPreview;