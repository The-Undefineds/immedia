var React = require('react');

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
      <div style={{textAlign:'center', backgroundColor: '#46008B', padding: '10px'}} >
        <input id='topbar' type='text' value={this.state.searchTerm} onChange={this.handleChange} onKeyDown={this.enterPressed} onSelect={this.handleChange}/>
        <input type='button' onClick={this.handleSubmit} value='Immedia search'/>
        <input onClick={this.goBackHome} value='home' type='button'/>
      </div>
      )
  }
})

module.exports = TopBar;