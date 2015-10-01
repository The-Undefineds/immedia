var React = require('react');

var SearchBar = require('./home_page/searchbar.jsx'),
    TopSearches = require('./home_page/topsearches.jsx');

var HomePage = React.createClass({

  tagline: "If you don’t know where you are going, you might wind up someplace else.",

  render: function(){
    return (
      <div style={{marginTop:'150px'}}>
        <h1 style={{color:'#46008B', fontSize:'60px', marginBottom:'0px'}}>Immedia</h1>
        <SearchBar searchInit={this.props.searchInit} atHome={this.props.atHome} />
      </div>
      )
  }
});

module.exports = HomePage;