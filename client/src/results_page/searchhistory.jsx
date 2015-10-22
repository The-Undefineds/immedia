/*
    file: searchhistory.jsx
    - - - - - - - - - - - - - 
    Parent container for a user's past searches, which
    is comprised of individual instances of the 
    PastSearch component.

    This component maintains in state a parsed version
    of a user's search history from Local Storage. When 
    new searches are initiated, an upstream component
    adds the new search to Local Storage, among other things,
    triggering a re-rendering that ultimately updates this component.

    When a user is visiting immedia for the first time, however,
    they will not have any recent searches. As such, this component
    sends a GET request to our server to display the immedia's
    most popular searches instead.
 */

// Required node modules
var React = require('react');

// React StyleSheet styling
var styles = require('../styles/results_page/searchhistory.jsx');

// immedia React component dependencies
var PastSearch = require('./pastsearch.jsx');


var SearchHistory = React.createClass({

  getInitialState: function() {
    return {
      pastSearches: JSON.parse(localStorage['immedia']).slice(1),
      history: [],
      width: this.props.window.width,
      height: this.props.window.height,
    };
  },

  componentDidMount: function() {
    this.compileHistory();
  },

  componentWillReceiveProps: function(nextProps) {
    if(this.props.searchTerm !== nextProps.searchTerm) {
      var searchTerm = nextProps.searchTerm;
      this.setState({
        pastSearches: JSON.parse(localStorage['immedia']).slice(1),
      });
      this.compileHistory(function(history) {
        this.setState({ history: history })
      }.bind(this), searchTerm);
    }

    if(!(this.state.width === nextProps.window.width && this.state.height === nextProps.window.height)) {
      this.setState({
        width: nextProps.window.width,
        height: nextProps.window.height,
      });
    }
  },

  componentDidUpdate: function(prevProps, prevState) {
    if(prevProps.searchTerm !== this.props.searchTerm) {
      this.compileHistory();
    }
  },

  render: function(){
    this.getDynamicStyles();

    return (
      <div id="recentlyVisited" style={styles.container}>
      { this.props.searchTerm === 'immediahomepage' ? <div style={styles.title}>popular searches</div> :
        <div style={styles.title}>recently visited</div> }
        <div style={styles.searches}>{ this.state.history }</div>
      </div>
    );
  },

  /*
      Handles the logic for whether the most popular searches should be shown
      for a first-time user or user returning to the homepage, or whether
      an existing user should see their prior search history.
   */
  compileHistory: function(callback, searchTerm) {
    var history = [];
    var component = this;
    searchTerm = searchTerm || this.props.searchTerm;

    if (searchTerm === 'immediahomepage') {
      $.get('http://localhost:3000/searches/popularSearches', function(data) {
        for (var term in data) {
          var popSearch = { searchTerm: term, img: data[term].img };
          history.push(<PastSearch page={ popSearch } searchInit={component.props.searchInit} />);
        }
        component.setState({ history: history });
      });
      return;
    }
    
    for (var i = 0; i < this.state.pastSearches.length; i++) {
      history.push(<PastSearch page={this.state.pastSearches[i]} searchInit={this.props.searchInit} />)
    }
    component.setState({ history: history });
    return;
  },

  getDynamicStyles: function() {
    var standardScreenSize = 1350;
    var optimalSearchHistorySize = 365;
    var searchHistoryTitleOffset = 130;

    styles.container.top = this.state.height - searchHistoryTitleOffset + 'px';
    styles.container.width = (this.state.width - standardScreenSize < 0 ? optimalSearchHistorySize * (this.state.width / standardScreenSize) : optimalSearchHistorySize) + 'px';
    styles.container.right = (this.state.width < standardScreenSize ? 0 : (this.state.width - standardScreenSize) / 2) + 'px';
    styles.title.width = (this.state.width - standardScreenSize < 0 ? optimalSearchHistorySize * (this.state.width / standardScreenSize) : optimalSearchHistorySize) + 'px';
    styles.searches.width = (this.state.width - standardScreenSize < 0 ? optimalSearchHistorySize * (this.state.width / standardScreenSize) : optimalSearchHistorySize) + 'px';
  },
});

module.exports = SearchHistory;
