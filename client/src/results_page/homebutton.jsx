var React = require('react');

var HomeButton = React.createClass({
  getInitialState: function(){
    return{

    };
  },

  render: function(){
    return (
      <div>
        <button type='button' > Home button </button>
      </div>
      )
  }
});

module.exports = HomeButton;