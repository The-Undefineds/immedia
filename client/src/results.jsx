var React = require('react');

var TimeLine = require('results_page/timeline'),
    WikiView = require('results_page/wikiview'),
    ImageView = require('results_page/imageview'),
    Preview = require('results_page/preview');

var ResultsView = React.createClass({

  render = function(){
    return (
      <TimeLine />
      <WikiView />
      <ImageView />
      <Preview />
      )
  }
});

module.exports = ResultsView;
