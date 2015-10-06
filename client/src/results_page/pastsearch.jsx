var React = require('react');

var PastSearch = React.createClass({

  // When the image is clicked, the user is redirected to the most recent version of that page (the search is done 
  // again with the search-term corresponding to the image)
  loadPage: function(){
    this.props.searchInit(this.props.page.searchTerm);
  },

  render: function(){
    return (
        <div>
          <img src={this.props.page.img} style={{width: '70px', height: '95px' }} onClick={this.loadPage}></img>
        </div>
      )
  }

});

module.exports = PastSearch;
