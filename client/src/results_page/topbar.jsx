var React = require('react');
var StyleSheet = require('react-style');

var styles = StyleSheet.create({
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

var TopBar = React.createClass({

  getInitialState: function(){
    return {
      searchTerm: '',
      errorHandle: '',
      width: this.props.window.width,
      height: this.props.window.height,
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
      if (this.state.suggestedSearchTerm !== '') {
        this.props.searchInit(this.state.suggestedSearchTerm);
      } else {
        this.props.searchInit(this.state.searchTerm);
      }
      // this.setState({ searchTerm: '' });
    }
  },

  goBackHome: function(){ this.props.goBackHome(); },
  
  componentDidMount : function() {
    var component = this;
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
                component.setState({ suggestedSearchTerm: data[1][0] })
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

  componentWillReceiveProps: function(nextProps) {
    if(!(this.state.width === nextProps.window.width && this.state.height === nextProps.window.height)) {
      this.setState({
        width: nextProps.window.width,
        height: nextProps.window.height,
      });
    }
  },

  render: function(){
    this.getDynamicStyles();

    return (
      <div id="navbar" style={styles.topBar}>
        <img src={'./immedia_logo.png'} height={40} width={40 * (167/137)} style={styles.logo} onClick={this.goBackHome} />
        <span style={styles.title} onClick={this.goBackHome}>immedia</span>
        <input id='topbar' type='text' style={styles.searchBar} value={this.state.searchTerm} onChange={this.handleChange} onKeyDown={this.enterPressed} onSelect={this.handleChange}/>
        <input type='button' style={styles.searchButton} onClick={this.handleSubmit} value='immedia search'/>
      </div>
    );
  },

  getDynamicStyles: function() {
    styles.topBar = {
      width: this.state.width,
      height: '50px',
      backgroundColor: 'rgba(128,128,128,0.1)',
      textAlign: 'center',
    };

    styles.searchBar = {
      marginTop: '12px',
      verticalAlign: 'middle',
      width: this.state.width * (400 / 1378),
      height: '25px',
      paddingLeft: '10px',
    };
  },

})

module.exports = TopBar;