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

  render: function(){
    return (
      <div>
        <input type='text' value={this.state.searchTerm} onChange={this.handleChange} onKeyDown={this.enterPressed} />
        <span>
          <button type='button' onClick={this.handleSubmit} > Immedia Search </button>
        </span>
      </div>
      )
  }
})

module.exports = TopBar;