var React = require('react');

var HomeButton = React.createClass({
  getInitialState: function(){
    return{

    };
  },

  render: function(){
    return (
      <div>
        <button type='button' onClick={this.props.returnHome()} > Home </button>
      </div>
      )
  }
});

module.exports = HomeButton;