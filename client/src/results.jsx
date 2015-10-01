var React = require('react');

var TreeTimeLine = require('./results_page/treetimeline.jsx'),
    ForceTimeLine = require('./results_page/forcetimeline.jsx'),
    WikiView = require('./results_page/wikiview.jsx'),
    ImageView = require('./results_page/imageview.jsx'),
    Preview = require('./results_page/preview.jsx'),
    TopBar = require('./results_page/topbar.jsx');

var ResultsView = React.createClass({

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
        <TopBar queryTerm={this.queryTerm} goBackHome={this.props.goBackHome} />
        <WikiView searchTerm={this.props.searchTerm}/>
        <TreeTimeLine searchTerm={this.props.searchTerm} mouseOver={this.mouseOver}/>
        <div id="preview"></div>
        <ImageView />
      </div>
    );
  }
});

module.exports = ResultsView;