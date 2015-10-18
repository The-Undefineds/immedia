var React = require('react');
var StyleSheet = require('react-style');

var TreeTimeLine = require('./results_page/treetimeline.jsx'),
    WikiView = require('./results_page/wikiview.jsx'),
    Preview = require('./results_page/preview.jsx'),
    TopBar = require('./results_page/topbar.jsx'),
    SearchHistory = require('./results_page/searchhistory.jsx');

var ResultsView = React.createClass({

  getInitialState: function() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },

  componentDidMount: function() {
    window.addEventListener('resize', this.handleResize);
    this.renderPreview({source: ''});
  },

  componentWillReceiveProps: function() {
    this.item = {source: ''};
    this.renderPreview(this.item);
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },
  
  render: function(){
    return (
      <div id="results">
        <TopBar searchInit={this.props.searchInit} goBackHome={this.props.goBackHome} window={this.state} searchTerm={this.props.searchTerm} />
        <WikiView searchTerm={this.props.searchTerm} searchInit={this.props.searchInit} window={this.state} />
        <TreeTimeLine searchTerm={this.props.searchTerm} mouseOver={this.mouseOver} window={this.state}/>
        <div id="preview"></div>
        <SearchHistory searchTerm={this.props.searchTerm} searchInit={this.props.searchInit} window={this.state} />
      </div>
    );
  },

  item: {source: ''},

  renderPreview: function(item) {
    React.render(
      <Preview previewItem={item} window={this.state} />,
      document.getElementById('preview')
    );
  },

  handleResize: function() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    this.renderPreview(this.item);
  },

  mouseOver: function(item){   
    this.item = item;
    this.renderPreview(this.item);
  },
});

module.exports = ResultsView;
