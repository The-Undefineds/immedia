var React = require('react');
var StyleSheet = require('react-style');

var styles = StyleSheet.create({
  directions: {
    fontFamily: 'Nunito',
    fontSize: '24px',
    color: '#00BFFF',
  }
});

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