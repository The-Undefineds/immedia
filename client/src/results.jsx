var React = require('react');

var TreeTimeLine = require('./results_page/treetimeline.jsx'),
    ForceTimeLine = require('./results_page/forcetimeline.jsx'),
    WikiView = require('./results_page/wikiview.jsx'),
    Preview = require('./results_page/preview.jsx'),
    TopBar = require('./results_page/topbar.jsx');

var ResultsView = React.createClass({

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
      )
  },

  render: function(){
    return (
      <div id="results">
        <TopBar searchInit={this.props.searchInit} goBackHome={this.props.goBackHome} />
        <TreeTimeLine searchTerm={this.props.searchTerm} mouseOver={this.mouseOver} />
        <WikiView searchTerm={this.props.searchTerm} searchInit={this.props.searchInit} />
        <div id="preview"></div>
        <p id="pastSearches_header">Recently Viewed</p>
        <div id="pastSearches" style={{textAlign:'center'}}>
        </div>
      </div>
    );
  },
});

module.exports = ResultsView;