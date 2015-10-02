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
    this.props.searchInit(this.state.searchTerm);
    this.setState({ searchTerm: '' });
  },

  goBackHome: function(){ this.props.goBackHome(); },

  render: function(){
    return (
      <div style={{textAlign:'center', backgroundColor: '#46008B', padding: '10px'}} >
        <input type='text' value={this.state.searchTerm} onChange={this.handleChange} onKeyDown={this.enterPressed} />
        <input type='button' onClick={this.handleSubmit} value='Immedia search'/>
        <input onClick={this.goBackHome} value='home' type='button'/>
      </div>
      )
  }
})

module.exports = TopBar;