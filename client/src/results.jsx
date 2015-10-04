var React = require('react');

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
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },
  
  handleResize: function(e) {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  },

  queryTerm: function(searchTerm){
    this.setState({
      searchTerm: searchTerm
    });
  },

  mouseOver: function(item){
    
    this.hasMouseOver = true;
    this.previewItem = item;

    $preview = $('#preview');
    if ($preview[0].localName === 'iframe') {
      $preview.remove();
      $('#results').append('<div id="preview"></div>')
    } else if (!$preview) {
      $('#results').append('<div id="preview"></div>')
    }
    React.render(
      <Preview previewItem={this.previewItem}/>,
      document.getElementById('preview')
    );
  },

  componentDidMount: function() {
    // $(window).scroll(function() {
    //    if($(window).height() === $(document).height()) {
    //        console.log("bottom!");
    //    }
    // });
    // console.log('scroll top:', $(window).height());
    // console.log('doc height:', $(document).height());
  },

  render: function(){

    return (
      <div id="results">
        <TopBar searchInit={this.props.searchInit} goBackHome={this.props.goBackHome} />
        <WikiView searchTerm={this.props.searchTerm} searchInit={this.props.searchInit} />
        <TreeTimeLine searchTerm={this.props.searchTerm} mouseOver={this.mouseOver} window={this.state} />
        <div id="preview"></div>
        <p id="pastSearches_header">Recently Viewed</p>
        <div id="pastSearches" style={{textAlign:'center'}}>
        </div>
      </div>
    );
  },
});

module.exports = ResultsView;