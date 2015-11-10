/*
    file: treetimeline.jsx
    - - - - - - - - - - - - - 
    An embedded D3 canvas that exists as
    a standalone React component. This component
    is responsible for kicking off all external
    AJAX calls that populate immedia. It maintains
    in its state an array of all the APIs data so 
    that the timeline can be re-rendered when the
    asynchronous calls return at different times.

    As such, the D3 canvas' data directive is populated
    by the data maintained in state.
 */

// Required node modules
var React = require('react');

var Nodes = require('./nodes.js');
var Links = require('./links.js');
var Axis = require('./axis.js');
var Query = require('./query.js');
var Dates = require('./dates.js');
var Images = require('./images.js');

var helpers = require('./helpers.js');

// React StyleSheet styling
var styles = require('../../styles/results_page/treetimeline.jsx');

// var idCounter = 0;

var TreeTimeLine = React.createClass({

  getInitialState: function(){
    
  //Initial timespan set at one week
  return {
      apiData: [],
      width: this.props.window.width,
      height: this.props.window.height,
    };
  },

  //Rendering the timeline will start a query for a search term passed down from the results page.
  query: function(searchTerm){
    
    for(var i = 0; i < Query.apis.length; i++){
      this.handleQuery({
        searchTerm: searchTerm.replace(/\s\(.*$/,''),
        days: 30,
        url: 'http://localhost:3000/api/' + Query.apis[i],
        api: Query.apis[i]
      });
    }
  },

  componentDidMount: function(){
    this.query(this.props.searchTerm.toLowerCase());
  },

  componentDidUpdate: function() {
    this.renderCanvas(0, 6, 1);    // Crucial step that (re-)renders D3 canvas
    this.renderCanvas(7, 13, 2);
    this.renderCanvas(14, 20, 3);
    this.renderCanvas(21, 28, 4);
  },

  componentWillReceiveProps: function(newProps){
    
    //If the new search term matches the term queried for the current results, nothing will change.
    if (this.props.searchTerm !== newProps.searchTerm) {
      helpers.renderCount = 0;
      this.query(newProps.searchTerm.toLowerCase());
      this.setState({apiData: []});
    }

    this.setState({
      width: newProps.window.width,
      height: newProps.window.height,
    });
  },

  // renderCount: 0,

  handleQuery: function(searchQuery){
    var component = this;

    $.post(searchQuery.url, searchQuery)
     .done(function(response) {

        if(typeof response === 'string') return;

        helpers.renderCount++;

        // Set State to initiate a re-rendering based on new API call data
        this.setState(function(previousState, currentProps) {
          // Make a copy of previous apiData to mutate and use to reset State
          var previousApiData = previousState['apiData'].slice();
          // Data is structured in an array that corresponds to sorted order by date descending
          // where each index has the following object:
          /*
              {
                'date': 'YYYY-MM-DD',
                'children': [
                  {
                    'source': 'nyt',
                    'children': [ {Article 1}, {Article 2}]
                  }
                ]
              }
          */

          // Loop through each day in apiData and add new articles/videos/etc
          // from returning API appropriately
          for(var date in response) {
            var i = 0;
            for(; i < previousApiData.length; i++) {
              if(previousApiData[i]['date'] === date) {
                previousApiData[i]['children'].push(response[date]);
                break;
              }
            }
            // If loop terminates fully, no content exists for date
            // so add content to the State array
            if(i === previousApiData.length) {
              previousApiData.push(
                {
                  'date': date, 
                  'children': [
                    response[date]
                  ]
                });
            }
          }
          // Sort State array with API data by date descending
          previousApiData.sort(function(a, b) {
            var aDate = new Date(a['date']);
            var bDate = new Date(b['date']);
            return bDate - aDate;
          });
          return {apiData: previousApiData};
        });
     }.bind(this));
  },

  render: function() {
    this.getDynamicStyles();

    return (
      <div id="d3container" style={styles.container}>
        <div id="d3blocker" style={styles.block}>
          <div id="d3title" style={styles.title}>recent events</div>
          <div id="d3subhead" style={styles.subhead}>hover over a bubble to preview</div>
        </div>
        <div id="d3canvas1" style={styles.d3} />
        <div id="d3canvas2" />
        <div id="d3canvas3" />
        <div id="d3canvas4" />
      </div>
    );
  },

  getDynamicStyles: function() {
    styles.container.left = (this.state.width - 1350 > 0 ? (this.state.width - 1350) / 2 : 0) + 'px';
    styles.container.width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 20 + 'px';
    styles.container.height = (this.state.height - 50) + 'px';
    styles.block.width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 10 + 'px';
    styles.title.width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 'px';
    styles.subhead.width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 'px';
    styles.d3.width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 20 + 'px';
    return;
  },

  renderCanvas: function(startDay, endDay, canvas) {

    var canvasProps = {
      startDay: startDay,
      endDay: endDay,
      canvas: canvas,
    };

    Dates.generateDates(canvasProps);
    
    var component = this;

    /* When re-rendering, old canvases are removed so the new canvas can take its place ... if the canvas is not
    removed before re-rendering, the next canvas will be appended to the div alongside the previous canvas. This 
    creates a very messy situation. */
    d3.select('#d3canvas' + canvas).selectAll('svg').remove();

    /* In case a source does not have an image URL, the node will be filled with a random color from the
    D3 category 20c color scale */
    canvasProps.colors = d3.scale.category20c();

    canvasProps.margin = {
      top: 10,
      right: 40,
      bottom: 20,
      left: 40
    };

    canvasProps.width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 20;
    canvasProps.height = this.state.height - 20;

    canvasProps.componentHeight = this.state.height;
    canvasProps.componentWidth = this.state.width;

    canvasProps.oldestItem = this.state.apiData[this.state.apiData.length - 1] ? 
                      this.state.apiData[this.state.apiData.length - 1] : null;


    var canvasData = helpers.processCanvasData(this.state.apiData, canvas);

    /* The new canvas will append to the proper d3canvas element on the page. If canvas is equal to 1, for example,
    the canvas will be rendered on #d3canvas1 and represents the most current week of data. Canvas 2 represents the previous
    week, and so on. */
    canvasProps.svg = d3.select('#d3canvas' + canvasProps.canvas).append('svg')
      .attr('class', 'svgclass' + canvasProps.canvas)
      .attr('class', 'timeLine')
      .attr('width', canvasProps.width)
      .attr('height', canvasProps.componentHeight)
      .append('g')
      .attr('transform', 'translate(60, ' + canvasProps.margin.top + ')');

    canvasProps.yScale = Axis.yScale(canvasProps);
    Axis.describeYAxis(canvasProps);

    /* Time to create a D3 tree layout structure with diagonal projections between parent and child nodes */
    canvasProps.tree = d3.layout.tree()
        .size([canvasProps.height, canvasProps.width])

    canvasProps.diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; })


    /* The all-important root is the source of data from which all child data nodes will project. */
    canvasProps.root = { 'name': 'data', 'children': canvasData };

    /* When all data has been loaded, toggle the nodes so that only the first two days of each week
    will be expanded (the other days are collapsed). This makes the canvas less crowded. */
    if (helpers.renderCount === Query.apis.length) {
      canvasProps.root.children.forEach(helpers.toggle);
      helpers.toggle(canvasProps.root.children[0]);
      helpers.toggle(canvasProps.root.children[1]);
    }

    update(canvasProps);

    /* The update function tells D3 how to render the new canvas any time new data is entered or 
    mouse events occur. */
    function update(canvasProps) {

      /* Nodes and links will be arranged in arrays for reference and when D3 needs to iterate through them
      to assign positions, attributes, etc. */
      canvasProps.nodes = canvasProps.tree.nodes(canvasProps.root).reverse();
      canvasProps.links = canvasProps.tree.links(canvasProps.nodes);

      var nodeCallbacks = {
        update: update,
        mouseOver: component.props.mouseOver,
      }

      canvasProps.defs = Images.describeDefs(canvasProps);

      Nodes.describeNodes(canvasProps, nodeCallbacks);

      Links.describeLinks(canvasProps);

    };
 
    /* Assure that the most recent item is automatically previewed in preview window */ 
    if (canvas === 1 && canvasData[0] && canvasData[0].children[0]) {
      helpers.mouseOver(canvasData[0].children[0].children[0], this.props.mouseOver);
    };
  },

});

module.exports = TreeTimeLine; 
