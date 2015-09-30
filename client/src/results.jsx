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
      WasSearchedFromTopBar: false,
      searchTerm: ''
      rerender: false,
    };
  },

  queryResults: {
    nyt: {
        // '2015-09-29':{
        //   source: 'nyt',
        //   children: [
        //     {
        //       title: 'Elon Musk',
        //       img: 'https://lh5.googleusercontent.com/-89xTT1Ctbrk/AAAAAAAAAAI/AAAAAAAAAAA/5gt6hkVvJHY/s0-c-k-no-ns/photo.jpg'
        //     }, {
        //       title: 'Sergie Brin',
        //       img: 'http://www.technologytell.com/gadgets/files/2014/05/Sergey-Brin-should-have-stayed-away-from-Google-Plus.jpg'
        //     }
        //   ]
        // }
      },
    youtube: {},
    twitter: {
        // '2015-09-29': {
        //   source: 'twitter',
        //   children: [
        //   {
        //     title: 'Donald Trump',
        //     img: 'http://uziiw38pmyg1ai60732c4011.wpengine.netdna-cdn.com/wp-content/dropzone/2015/08/RTX1GZCO.jpg'
        //   }, {
        //     title: 'The Donald',
        //     img: 'http://www.liberationnews.org/wp-content/uploads/2015/07/donaldtrump61815.jpg'
        //   }
        //   ]
        // }
      },
    wikipedia: {},
  },
  
  componentDidMount: function(){

    for(var id in this.queryResults){
      //not the best way of reasoning about this, will refactor after MVP.
      var searchTerm = WasSearchedFromTopBar ? this.state.searchTerm: this.props.searchTerm
      this.handleQuery({
        searchTerm: this.props.searchTerm,
        url: 'http://127.0.0.1:3000/api/' + id
      })
    }
  },

  handleQuery: function(searchQuery){
    $.post({
      url: searchQuery.url,
      data: searchQuery,
      dataType: 'jsonp',
      // type: 'POST',
  //       xhrFields: {
  //   withCredentials: true
  // },
      success: function(data){
        //this a supposed hack to leverage react automatic rerendering
        //for when state values are changed.
        //will be changed after we learn redux react data flow
        var source = data.source;
        this.queryResults[source] = data;
        this.setState({rerender: !this.state.rerender});
      
      }.bind(this),
      error: function(xhr, status, err){
        console.error(searchQuery.url, status, err.toString())
      }.bind(this)
    })
  },

  queryTerm: function(searchTerm){
    this.setState({
      searchTerm: searchTerm,
      WasSearchedFromTopBar: true,
    });
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
        <HomeButton returnHome={this.props.returnHome}/>
        <TopBar queryTerm={this.queryTerm}/>
        <TreeTimeLine data={this.queryResults}/>
        <WikiView data={this.queryResults.wikipedia}/>
        <ImageView data={this.queryResults.wikipedia} />
        <Preview />
      </div>
      )
  }
});

module.exports = ResultsView;