var React = require('react');

var HomePage = require('./homepage.jsx');
var ResultsView = require('./results.jsx');

var MainView = React.createClass({

  getInitialState: function(){
    return {
      atHome : true,
      searchTerm : '',
    }
  },

  searchInit: function(searchTerm){
    console.log('bang!');
    
    this.setState({ atHome : false,
                    searchTerm: searchTerm,
                  });
  },

  render: function(){
    return (
      <div>
        { this.state.atHome ? <HomePage searchInit={this.searchInit} atHome={this.state.atHome}/> : null }
        { !this.state.atHome ? <ResultsView searchTerm={this.state.searchTerm}/> : null }
      </div>
      )
  }
});

React.render(<MainView />, document.getElementById('container'));