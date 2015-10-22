/*
    file: summary.jsx
    - - - - - - - - - - - - - 
    Content component for the Wikipedia
    summary displayed on every immedia page.

    The component receives all the Wikipedia
    information as props (summary, profileImage)
    from its parent component Wikiview, which is
    responsible for the actual GET request to Wikipedia
    and subsequent parsing.

    Of note is the jQuery click listener that any link in
    a Wikipedia summary may have; when any such link is clicked,
    a new immedia search for that subject is executed.
 */

// Required node modules
var React = require('react');

// React StyleSheet styling
var styles = require('../styles/results_page/summary.jsx');


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

  /*
      jQuery click listener that triggers a new immedia search
      for the subject of the URL clicked in the Wikipedia
      summary
   */
  componentDidUpdate: function(prevProps, prevState) {
    $(function() {
      $('.wikiLink').on('click', function(event) {
        this.props.searchInit($(event.target).text());
      }.bind(this));
    }.bind(this));
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
    var standardScreenSize = 1350;
    var optimalSummarySize = 365;
    var wikipediaTitleOffset = 200;
    var summaryOffset = 40;
    var optimalImageRatio = 0.4;

    styles.summary.height = (this.state.height - wikipediaTitleOffset) + 'px';
    styles.title.width = (this.state.width < standardScreenSize ? optimalSummarySize * (this.state.width / standardScreenSize) : optimalSummarySize) + 'px';
    styles.image.height = this.state.height * optimalImageRatio + 'px';
    styles.body.height = (this.state.height - wikipediaTitleOffset) - summaryOffset - (this.state.height * optimalImageRatio) + 'px';
  },

});

module.exports = Summary;
