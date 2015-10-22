var StyleSheet = require('react-style');

var NytPreviewStyles = StyleSheet.create({
  preview: {
    top: '45px',
    paddingRight: '5px',
    position: 'absolute',
    overflow: 'scroll',
    paddingBottom: '5px',
  },
  anchor: {
    textDecoration: 'none',
    color: 'inherit',
  },
  headline: {
    marginTop: '0px',
    marginBottom: '10px',
    textAlign: 'left',
    paddingLeft: '10px',
  },
  byline: {
    marginTop: '5px',
    marginBottom: '5px',
    textAlign: 'left',
    paddingLeft: '10px',
  },
  image: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'left',
    paddingLeft: '10px',
  },
  searchButton: {
      verticalAlign: 'middle',
      marginLeft: '2px',
      marginTop: '10px',
      width: '100px',
      height: '25px',
      fontFamily: 'Nunito',
      fontSize: '12px',
      color: 'white',
      textAlign: 'center',
      background: '#3498db',
      cursor: 'pointer',
  },
});

module.exports = NytPreviewStyles;