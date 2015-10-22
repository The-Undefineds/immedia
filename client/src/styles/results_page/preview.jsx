var StyleSheet = require('react-style');

var PreviewStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50px',
    paddingRight: '10px',
    textAlign: 'center',
  },
  block: {
    position: 'fixed',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    marginBottom: '10px',
    height: '40px',
  },
  title: {
    fontFamily: 'Nunito',
    fontSize: '24px',
    color: '#00BFFF',
    backgroundColor: 'rgb(232,232,232)',
    marginTop: '10px',
    marginBottom: '10px',
    textAlign: 'left',
    paddingLeft: '5px',
    zIndex: '1',
    position: 'fixed',
  },
});

module.exports = PreviewStyles;