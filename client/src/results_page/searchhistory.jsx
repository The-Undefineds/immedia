var React = require('react');
var StyleSheet = require('react-style');

var PastSearch = require('./pastsearch.jsx');

var styles = StyleSheet.create({
  container: {
    right: '0px',
    position: 'absolute',
    height: '130px',
    marginRight: '5px',
    paddingLeft: '15px',
  },
  title: {
    fontFamily: 'Nunito',
    fontSize: '24px',
    color: '#00BFFF',
    marginBottom: '10px',
    textAlign: 'left',
    paddingLeft: '5px',
    position: 'absolute',
    top: '0px',
    height: '30px',
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  searches: {
    position: 'absolute',
    overflow: 'scroll',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    right: '0px',
    top: '40px',
    height: '90px',
  },
});

var SearchHistory = React.createClass({

  getInitialState: function() {
    return {
      pastSearches: [],
      width: this.props.window.width,
      height: this.props.window.height,
    };
  },

  componentWillMount: function() {
    this.setState({
      pastSearches: JSON.parse(localStorage['immedia']).slice(1),
    });
  },

  componentWillReceiveProps: function(nextProps) {
    if(this.props.searchTerm !== nextProps.searchTerm) {
      this.setState({
        pastSearches: JSON.parse(localStorage['immedia']).slice(1),
      });
    }

    if(!(this.state.width === nextProps.window.width && this.state.height === nextProps.window.height)) {
      this.setState({
        width: nextProps.window.width,
        height: nextProps.window.height,
      });
    }
  },

  render: function(){
    var history = this.compileHistory();
    this.getDynamicStyles();

    return (
      <div id="recentlyVisited" style={styles.container}>
        <div style={styles.title}>immedia: recently visited</div>
        <div style={styles.searches}>{ history }</div>
      </div>
    );
  },

  compileHistory: function() {
    var history = [];
    for (var i = 0; i < this.state.pastSearches.length; i++) {
      history.push(<PastSearch page={this.state.pastSearches[i]} searchInit={this.props.searchInit} />)
    }
    return history;
  },

  getDynamicStyles: function() {
    styles.container.top = this.state.height - 130 + 'px';
    styles.container.width = (this.state.width - 1350 < 0 ? 365 * (this.state.width / 1350) : 365) + 'px';
    styles.container.right = (this.state.width < 1350 ? 0 : (this.state.width - 1350) / 2) + 'px';
    styles.title.width = (this.state.width - 1350 < 0 ? 365 * (this.state.width / 1350) : 365) + 'px';
    styles.searches.width = (this.state.width - 1350 < 0 ? 365 * (this.state.width / 1350) : 365) + 'px';
  },
});

module.exports = SearchHistory;
