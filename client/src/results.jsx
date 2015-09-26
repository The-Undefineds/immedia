var React = require('react');

var TimeLine = require('./results_page/timeline.jsx'),
    WikiView = require('./results_page/wikiview.jsx'),
    ImageView = require('./results_page/imageview.jsx'),
    Preview = require('./results_page/preview.jsx'),
    TopBar = require('./results_page/topbar.jsx');

var ResultsView = React.createClass({

  render: function(){
    return (
      <div>
        <h1>[results_page placeholder]</h1>
        <TopBar />
        <TimeLine />
        <WikiView />
        <ImageView />
        <Preview />
      </div>
      )
  }
});

module.exports = ResultsView;