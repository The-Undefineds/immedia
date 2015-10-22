var StyleSheet = require('react-style');

var TreeTimelineStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50px',
    paddingRight: '10px',
    textAlign: 'center',
    overflow: 'scroll',
  },
  title: {
    position: 'fixed',
    fontFamily: 'Nunito',
    fontSize: '24px',
    color: '#00BFFF',
    backgroundColor: 'rgba(232, 232, 232, 1)',
    marginTop: '10px',
    marginBottom: '5px',
    textAlign: 'left',
    paddingLeft: '10px',
  },
  subhead: {
    position: 'fixed',
    fontFamily: 'Nunito',
    fontSize: '14px',
    color: 'rgb(128, 128, 128)',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    marginTop: '42px',
    marginBottom: '5px',
    textAlign: 'left',
    paddingLeft: '10px',
  },
  d3: {
    zIndex: -1,
    marginTop: '60px',
  },
  block: {
    position: 'fixed',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    height: '50px',
    marginBottom: '5px',
    paddingLeft: '10px',
    textAlign: 'left',
  }
});

module.exports = TreeTimelineStyles;