/*
    file: topbar.jsx
    - - - - - - - - - - - - - 
    Component for navigation bar atop
    each immedia results page. The bar
    contains the immedia search input box,
    which autocompletes a user's input
    with published article titles from Wikipedia.
 */

// Required node modules
var React = require('react');
var styles = require('../styles/results_page/topbar.jsx');

var TopBar = React.createClass({

  getInitialState: function(){
    return {
      searchTerm: '',
      errorHandle: '',
      width: this.props.window.width,
      height: this.props.window.height,
    };
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
        <input type='button' style={styles.downloadButton} value={"Get Chrome extension"} onClick={this.downloadExtension} />
      </div>
    );
  },

  getDynamicStyles: function() {
    var standardScreenSize = 1378;
    var optimalSearchBarSize = 400;

    styles.topBar.width = this.state.width;
    styles.searchBar.width = this.state.width * (optimalSearchBarSize / standardScreenSize);
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

  downloadExtension: function(){
    window.location.assign("http://bit.ly/1GjqyVh")
  },

})

module.exports = TopBar;
