var React = require('react');

var WikiView = React.createClass({

  render: function(){
    return (
      <div>{this.props.data}</div>
      )
  }

});

module.exports = WikiView;
