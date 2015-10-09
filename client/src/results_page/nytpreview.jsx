var React = require('react');
var StyleSheet = require('react-style');

var styles = StyleSheet.create({
  anchor: {
    textDecoration: 'none',
    color: 'inherit',
  },
  headline: {
    marginTop: '0px',
    marginBottom: '10px',
    textAlign: 'left',
  },
  byline: {
    marginTop: '5px',
    marginBottom: '5px',
    textAlign: 'left',
  },
  image: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'left',
    paddingLeft: '15px',
    paddingRight: '15px',
  },
});

var NytPreview = React.createClass({

  render: function() {
    var ratio = 1;
    if(this.props.previewItem.height > this.props.previewItem.width) {
      if((320 / this.props.previewItem.height) < 1) {
        ratio = 320 / this.props.previewItem.height;
      }
    } else {
      if((465 / this.props.previewItem.width) < 1) {
        ratio = 465 / this.props.previewItem.width;
      }
    }
    return (
      <a style={styles.anchor} href={ this.props.previewItem.url } target="_blank">
        <div>
          <h1 style={styles.headline}>{ this.props.previewItem.title }</h1>
          <h3 style={styles.byline}>{ this.props.previewItem.byline }</h3>
          { this.props.previewItem.img !== '' ? 
            <img src={ this.props.previewItem.img } style={styles.image} height={ this.props.previewItem.height * ratio } width= { this.props.previewItem.width * ratio }></img> :
            null
          }
          <p style={styles.body}>{ this.props.previewItem.abstract }</p>
        </div>
      </a>
    );
  },

});

module.exports = NytPreview;