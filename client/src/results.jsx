var React = require('react');

var TreeTimeLine = require('./results_page/treetimeline.jsx'),
    ForceTimeLine = require('./results_page/forcetimeline.jsx'),
    WikiView = require('./results_page/wikiview.jsx'),
    ImageView = require('./results_page/imageview.jsx'),
    Preview = require('./results_page/preview.jsx'),
    TopBar = require('./results_page/topbar.jsx'),
    HomeButton = require('./results_page/homebutton.jsx');

var ResultsView = React.createClass({

  getInitialState: function(){
    return {
      wasSearchedFromTopBar: false,
      searchTerm: '',
      nyt: {},
      youtube: {},
      wikipedia: {},
      twitter: {},
    };
  },

  apis: [
    'nyt',
    // 'wikipedia',
    // 'twitter',
    'youtube'
  ],
  
  componentDidMount: function(){
    for(var i = 0; i < this.apis.length; i++){
      //not the best way of reasoning about this, will refactor after MVP.
      var searchTerm = this.state.wasSearchedFromTopBar ? this.state.searchTerm: this.props.searchTerm;
      this.handleQuery({
        searchTerm: this.props.searchTerm,
        url: 'http://127.0.0.1:3000/api/' + this.apis[i],
        api: this.apis[i]
      });
    }
  },

  handleQuery: function(searchQuery){
    $.post(searchQuery.url, searchQuery)
     .done(function(response) {
        var obj = {};
        obj[searchQuery.api] = response;
        this.setState(obj);
     }.bind(this));
  },

  queryTerm: function(searchTerm){
    this.setState({
      searchTerm: searchTerm,
      wasSearchedFromTopBar: true,
    });
  },
  // mouseOver: function(){
  //   this.setState({hasMouseOver: true});
  // },

  // mouseOut: function(){
  //   this.setState({hasMouseOver: false});
  // },

  render: function(){
    console.log('rendering results');
    return (
      <div>
        <h1>Results</h1>
        <HomeButton />
        <TopBar queryTerm={this.queryTerm}/>
        <TreeTimeLine data={
          { nyt: this.state.nyt, twitter: this.state.twitter, youtube: this.state.youtube }
        }/>
        <WikiView data={this.state.wikipedia}/>
        <ImageView data={this.state.wikipedia} />
        <Preview />
      </div>
    );
  }
});

module.exports = ResultsView;