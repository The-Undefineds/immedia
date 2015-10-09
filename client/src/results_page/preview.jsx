var React = require('react');
var StyleSheet = require('react-style');

var NytPreview = require('./nytpreview.jsx');
var TwitterPreview = require('./twitterpreview.jsx');
var YouTubePreview = require('./youtubepreview.jsx');
var EmptyPreview = require('./emptypreview.jsx');

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '60px',
    paddingRight: '10px',
    textAlign: 'center',
  },
  title: {
    fontFamily: 'Nunito',
    fontSize: '24px',
    color: '#00BFFF',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    marginBottom: '10px',
    textAlign: 'left',
    paddingLeft: '5px',
  },
});

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
        <div id="previewTitle" style={styles.title}>{ this.props.previewItem.source || 'immmedia' }: preview</div>
        { this.props.previewItem.source === '' ? 
          <EmptyPreview window={this.state} /> : null }
        { this.props.previewItem.source === 'nyt' ? 
          <NytPreview previewItem={ this.props.previewItem } /> : null }
        { this.props.previewItem.source === 'twitter' ? 
          <TwitterPreview previewItem={ this.props.previewItem } /> : null }
        { this.props.previewItem.source === 'youtube' ? 
          <YouTubePreview previewItem={ this.props.previewItem } width={styles.container.width} height={styles.container.height} /> : null }
      </div>
    );
  },

  getDynamicStyles: function() {
    var $d3title = $('#d3title');
    styles.container.left = (this.state.width / 2) - (this.state.width - 1350 < 0 ? 500 * (this.state.width / 1350) / 2 : 250) + 'px';
    styles.container.width = (this.state.width - 1350 < 0 ? 500 * (this.state.width/1350) : 500) + 'px';
    styles.container.height = (this.state.height - 600 < 0 ? 600 * (this.state.height/783) : 600) + 'px';
  },
});

module.exports = Preview;
