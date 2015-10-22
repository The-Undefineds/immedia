/*
    file: pastsearch.jsx
    - - - - - - - - - - - - - 
    Individual components for each of a user's prior
    ten searches. The components are clickable images
    that initiate a new immedia search for the image
    clicked.
 */

// Required node modules
var React = require('react');

// React StyleSheet styling
var styles = require('../styles/results_page/pastsearch.jsx');

var PastSearch = React.createClass({

  // When the image is clicked, the user is redirected to the most recent version of that page (the search is done 
  // again with the search-term corresponding to the image)
  loadPage: function(){
    this.props.searchInit(this.props.page.searchTerm);
  },

  render: function(){
    return (
      <img src={this.props.page.img} style={styles.image} onClick={this.loadPage}></img>
    );
  }

});

module.exports = PastSearch;
