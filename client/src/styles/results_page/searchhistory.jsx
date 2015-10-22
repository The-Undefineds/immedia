var StyleSheet = require('react-style');

var SearchHistoryStyles = StyleSheet.create({
  container: {
    right: '0px',
    position: 'fixed',
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
    backgroundColor: 'rgba(232,232,232,1)',
  },
  searches: {
    position: 'absolute',
    'overflow-x': 'scroll',
    'overflow-y': 'hidden',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    right: '0px',
    top: '40px',
    height: '90px',
  },
});

module.exports = SearchHistoryStyles;