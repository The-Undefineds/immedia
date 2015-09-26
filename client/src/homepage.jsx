var React = require('react');

var SearchBar = require('./home_page/searchbar.jsx'),
    TopSearches = require('./home_page/topsearches.jsx');

var HomePage = React.createClass({

  tagline: "If you don’t know where you are going, you might wind up someplace else.",

  render: function(){
    return (
      <div>
        <h1>Immedia</h1>
        <p>{this.tagline}</p>
        <SearchBar searchInit={this.props.searchInit} atHome={this.props.atHome} />
        <TopSearches />
      </div>
      )
  }
});

module.exports = HomePage;