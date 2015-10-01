var React = require('react');

var Preview = React.createClass({

  render: function() {

    console.log('preview is rendered with item:', this.props.previewItem)
    
    var previewItem = this.props.previewItem;

    // $.ajax({
    //   type: 'GET',
    //   url: 'http://' + previewItem.url,
    //   dataType: 'jsonp',
    //   success: function(data) {
    //     console.log('success!', data);
    //   },
    //   failure: function(data) {
    //     console.log('whateva');
    //   }
    // })

    return (
      <div>
        <h1>{ previewItem.title }</h1>
      </div>  
      );
  }
});

module.exports = Preview;
