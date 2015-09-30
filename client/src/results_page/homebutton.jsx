var React = require('react');

var HomeButton = React.createClass({

  render: function(){
    return (
      <div>
        <button type='button' onClick={this.props.returnHome()} > Immedia Search </button>
      </div>
      )
  }
});

module.exports = HomeButton;