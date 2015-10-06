var React = require('react');
var StyleSheet = require('react-style');

var TreeTimeLine = require('./results_page/treetimeline.jsx'),
    ForceTimeLine = require('./results_page/forcetimeline.jsx'),
    WikiView = require('./results_page/wikiview.jsx'),
    Preview = require('./results_page/preview.jsx'),
    TopBar = require('./results_page/topbar.jsx');

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

    // $(window).scroll(function() {
    //    if($(window).height() === $(document).height()) {
    //        console.log("bottom!");
    //    }
    // });
    // console.log('scroll top:', $(window).height());
    // console.log('doc height:', $(document).height());
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
        <TopBar searchInit={this.props.searchInit} goBackHome={this.props.goBackHome} window={this.state} />
        <WikiView searchTerm={this.props.searchTerm} searchInit={this.props.searchInit} window={this.state} />
        <TreeTimeLine searchTerm={this.props.searchTerm} mouseOver={this.mouseOver} window={this.state} />
        <div id="preview"></div>
        <p id="pastSearches_header">Recently Viewed</p>
        <div id="pastSearches" style={{textAlign:'center'}}>
        </div>
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

  handleResize: function(e) {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    this.renderPreview(this.item);
  },

  queryTerm: function(searchTerm){
    this.setState({
      searchTerm: searchTerm
    });
  },

  mouseOver: function(item){    
    this.item = item;
    this.renderPreview(this.item);
  },
});

module.exports = ResultsView;