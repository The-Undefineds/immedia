var React = require('react');

var TopBar = React.createClass({

  getInitialState: function(){
    return {
      searchTerm: ''
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
    // send this.state.searchTerm in ajax 
    this.props.queryTerm(this.state.searchTerm);
  },

  goBackHome: function(){ this.props.goBackHome(); },

  render: function(){
    return (
      <div style={{textAlign:'right', backgroundColor: '#46008B', padding: '10px'}} >
        <input onClick={this.goBackHome} value='home' type='button'/>
        <input type='text' value={this.state.searchTerm} onChange={this.handleChange} onKeyDown={this.enterPressed} />
        <span>
          <input type='button' onClick={this.handleSubmit} value='Immedia search'/>
        </span>
      </div>
      )
  }
})

module.exports = TopBar;