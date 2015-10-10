var React = require('react');

var HomePage = require('./homepage.jsx');
var ResultsView = require('./results.jsx');

var MainView = React.createClass({

  getInitialState: function(){
    return {
      searchTerm : 'immediahomepage',
    }
  },

  // Checks localStorage for history, which is stored in an array
  // with element 0 being the most recent page. The number 0 
  // corresponds with the home-page.
  componentWillMount: function(){
    if (localStorage['immedia']) { 
      var history = JSON.parse(localStorage['immedia']);
    }
    var homePlaceholder = { searchTerm: 0 };
    if (!history) {
      //to-do: get most popular searches
      localStorage['immedia'] = JSON.stringify([homePlaceholder]);
    } else if (history[0].searchTerm !== 0) { 
      this.searchInit(history[0].searchTerm, true);
    }
  },

  // This function is passed down through 'props' to both the search-bar
  // on the home-page and the search-bar on the results-page
  searchInit: function(searchTerm, reload){
    // The parameter 'reload' tells us whether the function was called on a page-reload or
    // from a geniune search. If genuine, we want to add it to our history:
    if (!reload) {
      this.enqueue(searchTerm);
    }
    // Setting 'atHome' to false routes the home-page to the results-page
    this.setState({ 
      atHome : false,
      searchTerm: searchTerm,
    });
  },

  //Enqueues new search to user history (stored in localStorage).
  enqueue: function(searchTerm){
    // Removes page from history if it's being searched now (so there is no redundancy when we
    // add it to the front)
    var history = JSON.parse(localStorage['immedia']),
        newHist = [];

    for (var i = 0; i < history.length; i++) {
      if (searchTerm !== history[i].searchTerm) {
        newHist.push(history[i]);
      }
    }
    history = newHist;

    // This if/else statement ensures that no placeholders for the home-page, inputted above,
    // get kept in our history. We only want to know if the most recent page was the home-page,
    // for page-reload purposes. Otherwise, we don't keep track of it in the search-history
    // stored in localStorage.
    var store = { searchTerm: searchTerm };
    if (history[0].searchTerm === 0) {
      history[0] = store;
    } else {
      var length = history.unshift(store);
    }
   
    // Only the latest 10 pages are stored.
    if (length > 10) { 
      history.pop();
    }
    localStorage['immedia'] = JSON.stringify(history);
  },

  // Does the reverse of searchInit (routes to home-page by hiding results-page components).
  goBackHome: function(){
    this.setState({atHome : true });

    // This block stores the home-page as the last visited location, so that if the user reloads the page
    // when they are at the home-page, they get redirected to the home-page 
    var history = JSON.parse(localStorage['immedia']);
    // 'If' statement keeps the home-page from being added multiple times to the user's history
    if (history[0].searchTerm !== 0) {
      // Again, a value of 0 for 'searchTerm' indicates being at the home-page
      history.unshift({ searchTerm: 0 });
    }
    localStorage['immedia'] = JSON.stringify(history);
  },

  render: function(){

    return (
      <div>
        <ResultsView searchTerm={this.state.searchTerm} searchInit={this.searchInit} />
      </div>
      )
  },

});

React.render(<MainView />, document.getElementById('container'));