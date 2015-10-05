var React = require('react');

var PastSearch = require('./pastsearch.jsx');

var SearchHistory = React.createClass({

  render: function(){
    var history = [];
    for (var i = 0; i < this.props.history.length; i++) {
      history.push(<PastSearch page={this.props.history[i]} searchInit={this.props.searchInit} />)
    }
    return (
        <div>
          { history }
        </div>
      )
  },

  style: {
    position: 'fixed',

  }

});

module.exports = SearchHistory;
