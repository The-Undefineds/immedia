var React = require('react');

var TreeTimeLine = require('./results_page/treetimeline.jsx'),
    ForceTimeLine = require('./results_page/forcetimeline.jsx'),
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
        <TreeTimeLine />
        <WikiView />
        <ImageView />
        <Preview />
      </div>
      )
  }
});

module.exports = ResultsView;