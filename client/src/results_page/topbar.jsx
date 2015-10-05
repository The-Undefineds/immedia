var React = require('react');
var StyleSheet = require('react-style');

var styles = StyleSheet.create({
  topBar: {
    width: window.innerWidth,
    height: '50px',
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  logo: {
    position: 'absolute',
    left: '15px',
    marginTop: '5px',
  },
  title: {
    position: 'absolute',
    left: '70px',
    marginTop: '5px',
    marginLeft: '2px',
    paddingTop: '2px',
    fontSize: '22px',
    fontFamily: 'Avenir',
    color: '#00BFFF',
  },
});

var TopBar = React.createClass({

  getInitialState: function(){
    return {
      searchTerm: '',
      errorHandle: ''
    };
  },

  handleChange: function(event){
    this.setState({ searchTerm: event.target.value });
  },
  
  enterPressed: function(event){
    if (event.keyCode === 13) {
      this.handleSubmit();
    }
  },

  handleSubmit: function(){
    if(this.state.searchTerm.search(/\w/g) === -1)
      // alert('Please input something');
      this.setState({errorHandle: 'Input a search term'});
    else {
      this.props.searchInit(this.state.searchTerm);
      this.setState({ searchTerm: '' });
    }
  },

  goBackHome: function(){ this.props.goBackHome(); },
  
  componentDidMount : function() {
      $(function() {
        $( "#topbar" ).autocomplete({
          source: function( request, response ) {
            $.ajax({
              url: "http://en.wikipedia.org/w/api.php",
              dataType: "jsonp",
              data: {
                'action': "opensearch",
                'format': "json",
                'search': request.term
              },
              success: function( data ) {
                response(data[1]);
              }
            });
          },
          minLength: 3,
          open: function() {
            $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
          },
          close: function() {
            $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
          }
        });
      });
  },

  render: function(){
    return (
      <div style={styles.topBar}>
        <img src={'./immedia_logo.png'} height={40} width={40 * (167/137)} style={styles.logo} onClick={this.goBackHome} />
        <span style={styles.title} onClick={this.goBackHome}>immedia</span>
        <input id='topbar' type='text' value={this.state.searchTerm} onChange={this.handleChange} onKeyDown={this.enterPressed} onSelect={this.handleChange}/>
        <input type='button' onClick={this.handleSubmit} value='Immedia search'/>
        <input onClick={this.goBackHome} value='home' type='button'/>
      </div>
    );
  }
})

module.exports = TopBar;