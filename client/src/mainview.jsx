var React = require('react');

var HomePage = require('./homepage.jsx');
var ResultsView = require('./results.jsx');

var MainView = React.createClass({

  getInitialState: function(){
    return {
      atHome : true
    }
  },

  searchInit: function(){
    console.log('bang!');
    this.setState({ atHome : false });
  },

  render: function(){
    return (
      <div>
        { this.state.atHome ? <HomePage searchInit={this.searchInit} atHome={this.state.atHome} /> : null }
        { !this.state.atHome ? <ResultsView /> : null }
      </div>
      )
  }
});

React.render(<MainView />, document.getElementById('container'));