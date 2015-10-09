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
    marginBottom: '10px',
    textAlign: 'left',
    paddingLeft: '5px',
  },
  image: {
    width: 'auto',
  },
  body: {
    fontFamily: 'Nunito',
    fontSize: '14px',
    textAlign: 'left',
    overflow: 'scroll',
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
    var searchTermClean = this.props.searchTerm.replace(/\s\(.*$/, '').toLowerCase();
    this.getDynamicStyles();

    return (
      <div id="wikiSummary" style={styles.summary}>
        <div id="wikiTitle" style={styles.title}>wiki: {searchTermClean}</div>
        <img id="wikiImage" style={styles.image} src={this.props.profileImage}></img>
        <div id="wikiBody" style={styles.body} dangerouslySetInnerHTML={{__html: this.props.summary}}></div>
      </div>
    );
  },

  getDynamicStyles: function() {
    var $wikiTitle = $('#wikiTitle');
    styles.summary.height = (this.state.height - 60 - 140) + 'px';
    styles.image.height = (this.state.height * 0.4) + 'px';
    styles.body.height = (this.state.height - 60 - 140) - $wikiTitle.height() - (this.state.height * 0.4) + 'px';
    styles.title.width = (this.state.width < 1350 ? 365 * (this.state.width / 1350) : 365) + 'px';
  },

});

module.exports = Summary;