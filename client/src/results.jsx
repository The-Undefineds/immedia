/*
    file: results.jsx
    - - - - - - - - - - - - - - 
    Component that houses the majority of immedia.
    Its state tracks window size so that child
    components can be updated accordingly upon a 
    resizing event with only one listener.

    The Preview React component is actually housed outside
    the render() function because it's re-rendering
    is conditional on an action taken by a sibling component.
    Rather than re-rendering the entire page, separating the 
    Preview component allows us to trigger re-rendering
    when this action occurs.
 */

// Required node modules
var React = require('react');

// immedia React component dependencies
var TreeTimeLine = require('./results_page/timeline/treetimeline.jsx');
var WikiView = require('./results_page/wikiview.jsx');
var Preview = require('./results_page/preview.jsx');
var TopBar = require('./results_page/topbar.jsx');
var SearchHistory = require('./results_page/searchhistory.jsx');


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

  /*
      Property used to keep track of which media source
      is triggering a Preview action
   */
  item: {source: ''},

  /*
      Manual re-rendering of the Preview component when an
      action in a sibling component (hovering over a new media
      bubble in the TreeTimeLine) occurs. A callback is passed
      to the TreeTimeLine component that initiates this.
   */
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