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
      // wasSearchedFromTopBar: false,
      // searchTerm: '',
      // nyt: {},
      // youtube: {},
      // wikipedia: {},
      // twitter: {},
      
      //synchronous method
      rerender: true,
    };
  },

  // handleQuery: function(searchQuery){
  //   $.post({
  //     url: searchQuery.url,
  //     data: searchQuery,
  //     dataType: 'jsonp',
  //     // type: 'POST',
  // //       xhrFields: {
  // //   withCredentials: true
  // // },
  //     success: function(data){
  //       //this a supposed hack to leverage react automatic rerendering
  //       //for when state values are changed.
  //       //will be changed after we learn redux react data flow
  //       var source = data.source;
  //       this.queryResults[source] = data;
  //       this.setState({rerender: !this.state.rerender});
      
  //     }.bind(this),
  //     error: function(xhr, status, err){
  //       console.error(searchQuery.url, status, err.toString())
  //     }.bind(this)
  //   })
  // },

  apis: [
    'nyt',
    // 'wikipedia',
    // 'twitter',
    'youtube'
  ],

  searchResults: {},

  getCounter: 0,
  
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
        // var obj = {};
        // obj[searchQuery.api] = response;
        // this.setState(obj);

        //synch method
        this.searchResults[searchQuery.api] = response;
        this.getCounter++;
        if (this.getCounter === this.apis.length) {
          this.setState({rerender: !this.state.rerender});
        }
     }.bind(this));
  },

  queryTerm: function(searchTerm){
    this.setState({
      searchTerm: searchTerm,
      wasSearchedFromTopBar: true,
    });
  },
  
  mouseOver: function(item){
    this.hasMouseOver = true;
    this.previewItem = item;
    React.render(
      <Preview previewItem={this.previewItem}/>,
      document.getElementById('preview')
      )
  },

  mouseOut: function(item){
    this.setState({hasMouseOver: false});
  },

  handleClick: function(item) {
    this.setState({clicked: true})
  },

  render: function(){
    return (
      <div>
        <h1>Results</h1>
        <HomeButton />
        <TopBar queryTerm={this.queryTerm}/>
        <WikiView searchTerm={this.props.searchTerm}/>
        <TreeTimeLine data={this.searchResults} mouseOver={this.mouseOver}/>
        <div id="preview"></div>
        <ImageView data={this.state.wikipedia} />      
      </div>
    );
  }
});


// { nyt: this.state.nyt, twitter: this.state.twitter, youtube: this.state.youtube }
module.exports = ResultsView;