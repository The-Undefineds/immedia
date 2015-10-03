var React = require('react');

var SearchBar = React.createClass({

  getInitialState: function(){
    return {
      searchTerm: ''
    };
  },

  handleChange: function(event){
    this.setState({ searchTerm: event.target.value });
    
  },

  enterPressed: function(event){
    if (event.keyCode === 13 && this.props.atHome) {
     this.handleSubmit();
    }
  },

  handleSubmit: function(){
    // send this.state.searchTerm in ajax
    if(this.state.searchTerm.search(/\w/g) === -1)
      alert('Please input something');
    else
      this.props.searchInit(this.state.searchTerm);
  },
  
  componentDidMount : function(){
    $(function() {
      function log( message ) {
        $( "<div>" ).text( message ).prependTo( "#log" );
        $( "#log" ).scrollTop( 0 );
      }
    
      $( "#searchbox" ).autocomplete({
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
        select: function( event, ui ) {
          console.log( ui.item ? "Selected: " + ui.item.label : "Nothing selected, input was " + this.value);
        },
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
      <div>
        <div className='ui-widget'>
          <input id='searchbox' type='text' value={this.state.searchTerm} onChange={this.handleChange} onKeyDown={this.enterPressed} onSelect={this.handleChange}/>
        </div>
        <span>
          <button type='button' onClick={this.handleSubmit} > Immedia Search </button>
        </span>
      </div>
      )
  }
});

module.exports = SearchBar;