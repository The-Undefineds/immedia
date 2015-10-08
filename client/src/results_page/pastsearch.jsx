var React = require('react');
var StyleSheet = require('react-style');

var styles = StyleSheet.create({
  image: {
    width: 'auto',
    height: '90px',
    cursor: 'pointer',
  },
})

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
