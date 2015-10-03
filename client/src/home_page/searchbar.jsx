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

  handleSubmit: function(event){
    // send this.state.searchTerm in ajax 
    this.props.searchInit(this.state.searchTerm);
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