React = require('react');

SearchBar = require('../home_page/searchbar.jsx');

var TopBar = React.createClass({
  
  render: function(){
    return (
      <SearchBar />
      )
  }
})

module.exports = TopBar;