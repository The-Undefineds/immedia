/*
    file: emptypreview.jsx
    - - - - - - - - - - - - - - 
    An empty component that serves as a placeholder
    when no content is previewed.
 */

// Required node modules
var React = require('react');

// React StyleSheet styling
var styles = require('../styles/results_page/emptypreview.jsx');

var EmptyPreview = React.createClass({

  getInitialState: function() {
    return {
      width: this.props.window.width,
      height: this.props.window.height,
    }
  },

  render: function() {
    this.getDynamicStyles();

    return (
      <span style={styles.directions}></span>
    );
  },

  getDynamicStyles: function() {
    styles.directions.left = (this.state.width / 2) - 50 + 'px';
    styles.directions.width = (this.state.width - 1350 < 0 ? 500 * (this.state.width/1350) : 500) + 'px';
  },

});

module.exports = EmptyPreview;