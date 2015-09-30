var React = require('react');

var ImageView = React.createClass({

  render: function(){
    return (
      <div>{this.props.data}</div>
      )
  }
});

module.exports = ImageView;
