var StyleSheet = require('react-style');

var SummaryStyles = StyleSheet.create({
  summary: {
    position: 'absolute',
    textAlign: 'center',
    paddingRight: '5px',
  },
  title: {
    fontFamily: 'Nunito',
    fontSize: '24px',
    color: '#00BFFF',
    backgroundColor: 'rgb(232, 232, 232)',
    marginBottom: '10px',
    textAlign: 'left',
    paddingLeft: '5px',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  body: {
    fontFamily: 'Nunito',
    fontSize: '14px',
    textAlign: 'left',
    overflow: 'scroll',
  },
});

module.exports = SummaryStyles;