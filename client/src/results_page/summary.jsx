var React = require('react');
var StyleSheet = require('react-style');

var styles = StyleSheet.create({
  summary: {
    position: 'absolute',
    textAlign: 'center',
    paddingRight: '5px',
  },
  title: {
    fontFamily: 'Nunito',
    fontSize: '24px',
    color: '#00BFFF',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  image: {
    width: 'auto',
  },
  body: {
    fontFamily: 'Nunito',
    fontSize: '14px',
    textAlign: 'left',
    overflow: 'scroll',
    height: '125px',
  },
});

var Summary = React.createClass({

  getInitialState: function() {
    return {
      width: this.props.window.width,
      height: this.props.window.height,
    }
  },

  componentDidMount: function() {
    this.getDynamicStyles();

    $('.wikiLink').on('click', function() {
      this.props.searchInit($(this).text());
    }.bind(this));
  },

  componentWillReceiveProps: function(nextProps) {
    if(!(this.state.width === nextProps.window.width && this.state.height === nextProps.window.height)) {
      this.setState({
        width: nextProps.window.width,
        height: nextProps.window.height,
      });
    }
  },

  render: function() {
    this.getDynamicStyles();

    return (
      <div id="wikiSummary" style={styles.summary}>
        <div id="wikiTitle" style={styles.title}>{this.props.searchTerm}</div>
        <img id="wikiImage" style={styles.image} src={this.props.profileImage}></img>
        <div id="wikiBody" style={styles.body} dangerouslySetInnerHTML={{__html: this.props.summary}}></div>
      </div>
    );
  },

  getDynamicStyles: function() {
    var $wikiTitle = $('#wikiTitle');
    var $wikiImage = $('#wikiImage');
    var wikiImageHeight = $wikiImage.height() ? $wikiImage.height() : 300;
    styles.image.maxHeight = (this.state.height * 0.6) + 'px';
    styles.summary.height = (this.state.height - 100 - 150) + 'px';
    styles.body.height = (this.state.height - 100 - 150) - $wikiTitle.height() - wikiImageHeight + 'px';
    styles.title.width = (this.state.width < 1350 ? 365 * (this.state.width / 1350) : 365) + 'px';
  },

});

module.exports = Summary;