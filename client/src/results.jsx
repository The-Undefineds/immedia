var React = require('react');

var TimeLine = require('./results_page/timeline.jsx'),
    WikiView = require('./results_page/wikiview.jsx'),
    ImageView = require('./results_page/imageview.jsx'),
    Preview = require('./results_page/preview.jsx');

var ResultsView = React.createClass({

  render: function(){
    return (
      <div>
        <TimeLine />
        <WikiView />
        <ImageView />
        <Preview />
      </div>
      )
  }
});

module.exports = ResultsView;