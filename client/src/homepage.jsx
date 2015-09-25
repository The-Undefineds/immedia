var React = require('react');

var SearchBar = require('home_page/searchbar'),
    TopSearches = require('home_page/topsearches');

var HomePage = React.createClass({

  getInitialState: function(){
    return {

    }
  },

  tagline: "If you don’t know where you are going, you might wind up someplace else.",

  render: function(){
    return (
        <h1>Immedia</h1>
        <p>{this.tagline}</p>
        <SearchBar />
        <TopSearches />
      )
  }
});

var element = React.createElement(HomePage);
React.render(element, document.querySelector('.container'));