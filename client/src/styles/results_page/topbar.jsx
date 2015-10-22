var StyleSheet = require('react-style');

var TopBarStyles = StyleSheet.create({
  topBar: {
      zIndex: 1,
      position: 'fixed',
      height: '50px',
      backgroundColor: 'rgba(232,232,232,1)',
      textAlign: 'center',      
  },
  logo: {
    position: 'absolute',
    left: '15px',
    marginTop: '6px',
    cursor: 'pointer',
  },
  title: {
    position: 'absolute',
    left: '70px',
    marginTop: '8px',
    marginLeft: '2px',
    paddingTop: '2px',
    fontSize: '24px',
    fontFamily: 'Nunito',
    color: '#00BFFF',
    cursor: 'pointer',
  },
  searchBar: {
    marginTop: '12px',
    verticalAlign: 'middle',
    height: '25px',
    paddingLeft: '10px',
    fontFamily: 'Nunito',
    fontSize: '18px',
    color: 'rgb(128,128,128)',
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
  downloadButton: {
    borderRadius: '50px',
    position: 'absolute',
    right: '20px',
    marginTop: '8px',
    marginLeft: '2px',
    paddingTop: '2px',
    color: '#fff',
    fontWeight: 'normal',
    fontSize: '80%',
    background: '#44c31d',
    padding: '5px',
    cursor: 'pointer',
    width: '200px',
    height: '30px'
  }
});

module.exports = TopBarStyles;