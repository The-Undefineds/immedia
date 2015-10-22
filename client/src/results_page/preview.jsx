/*
    file: preview.jsx
    - - - - - - - - - - - - - 
    Parent container for all embedded media
    content previewed via the TreeTimeLine.

    The component receives the item to be previewed
    as a prop (previewItem) since the action to preview
    is triggered in a sibling component (TreeTimeLine).

    This component then determines which child preview
    component should be rendered based on the source
    of the prop passed.
 */

// Required node modules
var React = require('react');

// React StyleSheet styling
var styles = require('../styles/results_page/preview.jsx');

// immedia React component dependencies
var EmptyPreview = require('./emptypreview.jsx');
var NytPreview = require('./nytpreview.jsx');
var TwitterPreview = require('./twitterpreview.jsx');
var YouTubePreview = require('./youtubepreview.jsx');


var Preview = React.createClass({

  getInitialState: function() {
    return {
      width: this.props.window.width,
      height: this.props.window.height,
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      width: nextProps.window.width,
      height: nextProps.window.height,
    });
  },

  render: function() {
    this.getDynamicStyles();

    return (
      <div id="previewContent" style={styles.container}>
        <div id="previewBlocker" style={styles.block} >
          <div id="previewTitle" style={styles.title}>{ this.props.previewItem.source || 'immedia' }</div>
        </div>
        { this.props.previewItem.source === '' ? 
          <EmptyPreview window={this.state} width={styles.container.width} height={styles.container.height} window={this.state}/> : null }
        { this.props.previewItem.source === 'nyt' ? 
          <NytPreview previewItem={ this.props.previewItem } width={styles.container.width} height={styles.container.height} window={this.state}/> : null }
        { this.props.previewItem.source === 'twitter' || this.props.previewItem.source === 'twitter news' ? 
          <TwitterPreview previewItem={ this.props.previewItem } width={styles.container.width} height={styles.container.height} window={this.state}/> : null }
        { this.props.previewItem.source === 'youtube' ? 
          <YouTubePreview previewItem={ this.props.previewItem } width={styles.container.width} height={styles.container.height} window={this.state} /> : null }
      </div>
    );
  },

  getDynamicStyles: function() {
    var standardScreenSize = 1350;
    var optimalPreviewSize = 500;
    var previewTitleOffset = 60;

    styles.container.left = (this.state.width / 2) - (this.state.width - standardScreenSize < 0 ? optimalPreviewSize * (this.state.width / standardScreenSize) / 2 : optimalPreviewSize / 2) + 'px';
    styles.container.width = (this.state.width - standardScreenSize < 0 ? optimalPreviewSize * (this.state.width/standardScreenSize) : optimalPreviewSize) + 'px';
    styles.container.height = this.state.height - previewTitleOffset + 'px';
    styles.block.width = (this.state.width - standardScreenSize < 0 ? optimalPreviewSize * (this.state.width/standardScreenSize) : optimalPreviewSize) + 'px';
    styles.title.width = (this.state.width - standardScreenSize < 0 ? optimalPreviewSize * (this.state.width/standardScreenSize) : optimalPreviewSize) + 'px';
  },
});

module.exports = Preview;
