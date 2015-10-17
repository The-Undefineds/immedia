var React = require('react');
var StyleSheet = require('react-style');

var NytPreview = require('./nytpreview.jsx');
var TwitterPreview = require('./twitterpreview.jsx');
var YouTubePreview = require('./youtubepreview.jsx');
var EmptyPreview = require('./emptypreview.jsx');

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50px',
    paddingRight: '10px',
    textAlign: 'center',
  },
  block: {
    position: 'fixed',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    marginBottom: '10px',
    height: '40px',
  },
  title: {
    fontFamily: 'Nunito',
    fontSize: '24px',
    color: '#00BFFF',
    backgroundColor: 'rgb(232,232,232)',
    marginTop: '10px',
    marginBottom: '10px',
    textAlign: 'left',
    paddingLeft: '5px',
    zIndex: '1',
    position: 'fixed',
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
    styles.container.left = (this.state.width / 2) - (this.state.width - 1350 < 0 ? 500 * (this.state.width / 1350) / 2 : 250) + 'px';
    styles.container.width = (this.state.width - 1350 < 0 ? 500 * (this.state.width/1350) : 500) + 'px';
    styles.container.height = this.state.height - 60 + 'px';
    styles.block.width = (this.state.width - 1350 < 0 ? 500 * (this.state.width/1350) : 500) + 'px';
    styles.title.width = (this.state.width - 1350 < 0 ? 500 * (this.state.width/1350) : 500) + 'px';
  },
});

module.exports = Preview;
