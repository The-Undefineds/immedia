var React = require('react');
var StyleSheet = require('react-style');

var styles = StyleSheet.create({
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
      this.setState({errorHandle: 'Input a search term'});
    else {
      //If the user selects an item from the suggested search terms that is not the first suggestion, 
      //the user's selected term will be searched. Otherwise, the first suggested term on the list will be searched.
      if (this.state.searchTerm === 'immediahomepage') {
        this.props.searchInit('immediahomepage');
      };
      if (this.state.suggestedSearchTerm !== '') {
        if (this.state.suggestedSearchTerms.indexOf(this.state.searchTerm) !== -1) {
          this.props.searchInit(this.state.searchTerm)
        } else {
          this.props.searchInit(this.state.suggestedSearchTerms[0]);
        }
      } else {
        //If Wikipedia has not responded with a suggested search term, one more GET request will be attempted
        //If this fails, the text in the search box will be searched
        $.ajax({
          url: "http://en.wikipedia.org/w/api.php",
          dataType: "jsonp",
          data: {
            'action': "opensearch",
            'format': "json",
            'search': this.state.searchTerm,
          },
          success: function( data ) {
            if (data[1].indexOf(this.state.searchTerm) !== -1) {
              this.props.searchInit(this.state.searchTerm)
            } else {
              this.props.searchInit(data[1][0]);
            }
          },
          error: function( data ) {
            this.props.searchInit(this.state.searchTerm);
          }
        });
      }

      $('#topbar').val(this.state.searchTerm.replace(/\s\(.*$/, '').toLowerCase());
    }
  },

  goBackHome: function() {
    this.props.searchInit('immediahomepage');
  },
  
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
                component.setState({ suggestedSearchTerm: data[1][0], suggestedSearchTerms: data[1] })
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

    $('#topbar').val(this.props.searchTerm.replace(/\s\(.*$/, '').toLowerCase());
  },

  componentWillReceiveProps: function(nextProps) {
    if(!(this.state.width === nextProps.window.width && this.state.height === nextProps.window.height)) {
      this.setState({
        width: nextProps.window.width,
        height: nextProps.window.height,
      });
    }
  },

  downloadExtension: function(){
    console.log('downloading extension (fill me in)');
  },

  componentDidUpdate: function(prevProps, prevState) {
    if(prevProps.searchTerm !== this.props.searchTerm) {
      $('#topbar').val(this.props.searchTerm.replace(/\s\(.*$/, '').toLowerCase());
    }
  },

  render: function(){
    this.getDynamicStyles();

    return (
      <div id="navbar" style={styles.topBar}>
        <img src={'./immedia_logo.png'} height={40} width={40 * (167/137)} style={styles.logo} onClick={this.goBackHome} />
        <span style={styles.title} onClick={this.goBackHome}>immedia</span>
        <input id='topbar' type='text' style={styles.searchBar} onChange={this.handleChange} onKeyDown={this.enterPressed} onSelect={this.handleChange}/>
        <input type='button' style={styles.searchButton} onClick={this.handleSubmit} value='immedia search'/>
        <input type='button' style={styles.downloadButton} value={"Get chrome extension"} onClick={this.downloadExtension} />
      </div>
    );
  },

  getDynamicStyles: function() {
    styles.topBar.width = this.state.width;
    styles.searchBar.width = this.state.width * (400 / 1378);
  },

})

module.exports = TopBar;