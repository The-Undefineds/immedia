var React = require('react');

var TreeTimeLine = require('./results_page/treetimeline.jsx'),
    ForceTimeLine = require('./results_page/forcetimeline.jsx'),
    WikiView = require('./results_page/wikiview.jsx'),
    ImageView = require('./results_page/imageview.jsx'),
    Preview = require('./results_page/preview.jsx'),
    TopBar = require('./results_page/topbar.jsx');

var ResultsView = React.createClass({

  getInitialState: function(){
    return {
      nyt: {},
      youtube: {},
      twitter: {},
      wikipedia: {},
    };
  },
  componentDidMount: function(){
    for(key in this.state.data){
      this.handleQuery({
        searchTerm: this.props.searchTerm,
        url: '127.0.0.1/api/' + key
      })
    }
  },

  handleQuery: function(searchQuery){
    $.ajax({
      url: searchQuery.url,
      data: searchQuery,
      type: 'POST',
      success: function(data){
        var source = data.source;
        if(source === 'nyt'){
          this.setState({nyt: data})
        }
        else if(source === 'twitter'){
          this.setState({twitter: data})
        }
        else if(source === 'youtube'){
          this.setState({youtube: data})
        }
        else if(source === 'wikipedia'){
          this.setState({wikipedia: data})
        }
      }.bind(this),
      error: function(xhr, status, err){
        console.error(searchQuery.url, status, err.toString())
      }.bind(this)
    })
  },

  // mouseOver: function(){
  //   this.setState({hasMouseOver: true});
  // },

  // mouseOut: function(){
  //   this.setState({hasMouseOver: false});
  // },

  render: function(){
    return (
      <div>
        <h1>Results</h1>
        <TopBar />
        <TreeTimeLine data={this.state}/>
        <WikiView data={this.state.data.wikipedia}/>
        <ImageView data={this.state.data.wikipedia}/>
        <Preview />
      </div>
      )
  }
});

module.exports = ResultsView;