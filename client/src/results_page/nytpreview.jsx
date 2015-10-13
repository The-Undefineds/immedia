var React = require('react');
var StyleSheet = require('react-style');

var styles = StyleSheet.create({
  preview: {
    top: '45px',
    paddingRight: '5px',
    position: 'absolute',
    overflow: 'scroll',
    paddingBottom: '5px',
  },
  anchor: {
    textDecoration: 'none',
    color: 'inherit',
  },
  headline: {
    marginTop: '0px',
    marginBottom: '10px',
    textAlign: 'left',
    paddingLeft: '10px',
  },
  byline: {
    marginTop: '5px',
    marginBottom: '5px',
    textAlign: 'left',
    paddingLeft: '10px',
  },
  image: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'left',
    paddingLeft: '10px',
  },
  searchButton: {
      verticalAlign: 'middle',
      marginLeft: '2px',
      marginTop: '10px',
      width: '100px',
      height: '25px',
      fontFamily: 'Nunito',
      fontSize: '12px',
      color: 'white',
      textAlign: 'center',
      background: '#3498db',
      cursor: 'pointer',
  },
});

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
    if(this.props.previewItem.height > this.props.previewItem.width) {
      if((320 / this.props.previewItem.height) < 1) {
        ratio = 320 / this.props.previewItem.height;
      }
    } else {
      var width = (this.state.width - 1350 < 0 ? 500 * (this.state.width/1350) : 500) - 20;
      if((width / this.props.previewItem.width) < 1) {
        ratio = width / this.props.previewItem.width;
      }
    }

    styles.image.height = this.props.previewItem.height * ratio;
    styles.image.width = this.props.previewItem.width * ratio;

    styles.preview.width = (this.state.width - 1350 < 0 ? 500 * (this.state.width/1350) : 500) + 'px';
    styles.preview.height = this.state.height - 100 + 'px';
  },

});

module.exports = NytPreview;