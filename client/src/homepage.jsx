var React = require('react');
var StyleSheet = require('react-style');

var SearchBar = require('./home_page/searchbar.jsx'),
    TopSearches = require('./home_page/topsearches.jsx'),
    PopularSearches = require('./popularsearches.jsx');

var styles = StyleSheet.create({
  container: {
    textAlign: 'center',
    marginTop: '150px',
  },
  logo: {
    height: 'auto',
    width: '150px',
  },
  title: {
    fontFamily: 'Nunito',
    fontSize: '32px',
    color: '#00BFFF',
  },
});

var HomePage = React.createClass({

  getInitialState: function() {
    return {
      popularSearches: '',
    }
  },

  tagline: "If you don’t know where you are going, you might wind up someplace else.",
        // <h1 style={{color:'#46008B', fontSize:'60px', marginBottom:'0px'}}>Immedia</h1>


  render: function(){
    return (
      <div style={styles.container}>
        <img style={styles.logo} src={ './immedia_logo.png' } />
        <div style={styles.title}>immedia</div>
        <SearchBar searchInit={this.props.searchInit} atHome={this.props.atHome} />
        <PopularSearches />
      </div>
    );
  }
});

module.exports = HomePage;