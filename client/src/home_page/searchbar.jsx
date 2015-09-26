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
    this.props.searchInit();
  },

  render: function(){
    return (
      <div>
        <input type='text' value={this.state.searchTerm} onChange={this.handleChange} onKeyDown={this.enterPressed} onSubmit={this.handleSubmit} />
        <span>
          <button type='button' > Immedia Search </button>
        </span>
      </div>
      )
  }
});

module.exports = SearchBar;