/*
    file: nytpreview.jsx
    - - - - - - - - - - - - - 
    Separate component for displaying
    New York Times articles selected for preview.

    Content for preview is passed through as a prop
    (previewItem) since it is received from the
    TreeTimeLine.
 */

// Required node modules
var React = require('react');

// React StyleSheet styling
var styles = require('../styles/results_page/nytpreview.jsx');

var NytPreview = React.createClass({

  getInitialState: function() {
    return {
      width: this.props.window.width,
      height: this.props.window.height,
    }
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
      <a style={styles.anchor} href={ this.props.previewItem.url } target="_blank">
        <div style={styles.preview}>
          <h1 style={styles.headline}>{ this.props.previewItem.title }</h1>
          <h3 style={styles.byline}>{ this.props.previewItem.byline }</h3>
          { this.props.previewItem.img !== '' ? 
            <img src={ this.props.previewItem.img } style={styles.image} ></img> :
            null
          }
          <p style={styles.body}>{ this.props.previewItem.abstract }</p>
          <button style={styles.searchButton}>read more</button>
        </div>
      </a>
    );
  },

  getDynamicStyles: function() {
    var ratio = 1;
    var optimalImageSize = 320;
    var imageOffset = 20;
    var standardScreenSize = 1350;
    var optimalPreviewSize = 500;
    var navigationBarOffset = 100;

    if(this.props.previewItem.height > this.props.previewItem.width) {
      if((optimalImageSize / this.props.previewItem.height) < 1) {
        ratio = optimalImageSize / this.props.previewItem.height;
      }
    } else {
      var width = (this.state.width - standardScreenSize < 0 ? optimalPreviewSize * (this.state.width/standardScreenSize) : optimalPreviewSize) - imageOffset;
      if((width / this.props.previewItem.width) < 1) {
        ratio = width / this.props.previewItem.width;
      }
    }

    styles.image.height = this.props.previewItem.height * ratio;
    styles.image.width = this.props.previewItem.width * ratio;

    styles.preview.width = (this.state.width - standardScreenSize < 0 ? optimalPreviewSize * (this.state.width/standardScreenSize) : optimalPreviewSize) + 'px';
    styles.preview.height = this.state.height - navigationBarOffset + 'px';
  },

});

module.exports = NytPreview;