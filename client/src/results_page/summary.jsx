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
    backgroundColor: 'rgb(232, 232, 232)',
    marginBottom: '10px',
    textAlign: 'left',
    paddingLeft: '5px',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
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
  },

  componentDidUpdate: function(prevProps, prevState) {
    // if(prevProps.searchTerm !== this.props.searchTerm) {
      $(function() {
        $('.wikiLink').on('click', function(event) {
          this.props.searchInit($(event.target).text());
        }.bind(this));
      }.bind(this));
    // }
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
      <div id="wikiSummary" style={styles.summary}>
        <div id="wikiTitle" style={styles.title}>wikipedia</div>
        <img id="wikiImage" style={styles.image} src={this.props.profileImage}></img>
        <div id="wikiBody" style={styles.body} dangerouslySetInnerHTML={{__html: this.props.summary}}></div>
      </div>
    );
  },

  getDynamicStyles: function() {
    var $wikiTitle = $('#wikiTitle');
    styles.summary.height = (this.state.height - 60 - 140) + 'px';
    styles.title.width = (this.state.width < 1350 ? 365 * (this.state.width / 1350) : 365) + 'px';
    styles.image.height = this.state.height * 0.4 + 'px';
    styles.body.height = (this.state.height - 60 - 140) - 40 - (this.state.height * 0.4) + 'px';
  },

});

module.exports = Summary;
