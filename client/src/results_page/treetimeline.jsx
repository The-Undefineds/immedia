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

// React StyleSheet styling
var styles = require('../styles/results_page/treetimeline.jsx');

var idCounter = 0;

var TreeTimeLine = React.createClass({

  getInitialState: function(){
    
  //Initial timespan set at one week
  return {
      startTime: 0,
      endTime: 7,
      apiData: [],
      width: this.props.window.width,
      height: this.props.window.height,
    };
  },

  //Api's to be called are listed in this array
  apis: [
    'nyt',
    'twitter',
    'youtube',
    'news'
  ],

  //Rendering the timeline will start a query for a search term passed down from the results page.
  query: function(searchTerm){
    
    for(var i = 0; i < this.apis.length; i++){
      this.handleQuery({
        searchTerm: searchTerm.replace(/\s\(.*$/,''),
        days: 30,
        url: 'http://localhost:3000/api/' + this.apis[i],
        api: this.apis[i]
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
      this.renderCount = 0;
      this.query(newProps.searchTerm.toLowerCase());
      this.setState({apiData: []});
    }

    this.setState({
      width: newProps.window.width,
      height: newProps.window.height,
    });
  },

  renderCount: 0,

  handleQuery: function(searchQuery){
    var component = this;

    $.post(searchQuery.url, searchQuery)
     .done(function(response) {

        if(typeof response === 'string') return;

        component.renderCount++;

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

  dates: [],

  generateDates: function(startTime, endTime, canvas) {
      this.dates[canvas] = [];
      for (var i = startTime; i <= endTime; i++) {
      var date = new Date();
      date.setDate(date.getDate() - i);
      this.dates[canvas].push(date.toJSON().slice(0, 10));
    }
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

  mouseOver: function(item) {
    if (this.mousedOver === item) {
      return;
    } else {
      this.mousedOver = item;
    }

    item.hasOwnProperty('tweet_id_str') ? item.tweet_id = item.tweet_id_str : '';

    this.props.mouseOver({
        title: item.title,
        date: item.date,
        url: item.url,
        img: item.img,
        source: item.parent.source,
        id: item.id,
        tweetId: (item.hasOwnProperty('tweet_id_str') ? item.tweet_id_str : ''),
        byline: (item.hasOwnProperty('byline') ? item.byline : ''),
        videoId: (item.hasOwnProperty('videoId') ? item.videoId : ''),
        abstract: (item.hasOwnProperty('abstract') ? item.abstract : ''),
        height: (item.hasOwnProperty('height') ? item.height : ''),
        width: (item.hasOwnProperty('width') ? item.width : ''),
      });
  },

  renderCanvas: function(startDay, endDay, canvas) {

    this.generateDates(startDay, endDay, canvas);
    
    var component = this;

    /* When re-rendering, old canvases are removed so the new canvas can take its place ... if the canvas is not
    removed before re-rendering, the next canvas will be appended to the div alongside the previous canvas. This 
    creates a very messy situation. */
    d3.select('#d3canvas' + canvas).selectAll('svg').remove();

    /* In case a source does not have an image URL, the node will be filled with a random color from the
    D3 category 20c color scale */
    var colors = d3.scale.category20c();

    var margin = {
      top: 10,
      right: 40,
      bottom: 20,
      left: 40
    };

    var width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 20,
        height = this.state.height - 20;

    var oldestItem = this.state.apiData[this.state.apiData.length - 1] ? 
                      this.state.apiData[this.state.apiData.length - 1] : null;

    /* Because each canvas represents one week in time, only data dated within that week's time period
    will be included and rendered on the canvas */
    var canvasData = [];
    for (var i = 0; i < this.state.apiData.length; i++) {
      // if (i === startDay - 1) { continue; }
      if (this.dates[canvas].indexOf(this.state.apiData[i].date) !== -1) {
        canvasData.push(this.state.apiData[i]);
      }
    };

    /* Create a vertical D3 time scale, organized by day in descending order based on the 7-day period of dates
    generated by the component's generateDates function (dates are stored in the component's date property) */
    var y = d3.time.scale()
      .domain([new Date(this.dates[canvas][this.dates[canvas].length - 1]), new Date(this.dates[canvas][0])])
      .rangeRound([height - margin.bottom, canvas === 1 ? 80 : 40])

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(d3.time.days, 1)
      .tickFormat(d3.time.format('%a %d'))
      .tickSize(10)
      .tickPadding(10);

    /* The new canvas will append to the proper d3canvas element on the page. If canvas is equal to 1, for example,
    the canvas will be rendered on #d3canvas1 and represents the most current week of data. Canvas 2 represents the previous
    week, and so on. */
    var svg = d3.select('#d3canvas' + canvas).append('svg')
      .attr('class', 'svgclass' + canvas)
      .attr('class', 'timeLine')
      .attr('width', width)
      .attr('height', this.state.height)
      .append('g')
      .attr('transform', 'translate(60, ' + margin.top + ')');

    svg.append('g')
      .attr('class', 'yAxis')
      .attr({
        'font-family': 'Nunito',
        'font-size': 10 * (this.state.width / 1350) + 'px',
      })
      .attr({
        fill: 'none',
        stroke: '#000',
        'shape-rendering': 'crispEdges',
      })
      .call(yAxis);


    /* Time to create a D3 tree layout structure with diagonal projections between parent and child nodes */
    var tree = d3.layout.tree()
        .size([height, width])

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; })


    /* The all-important root is the source of data from which all child data nodes will project. */
    var root = { 'name': 'data', 'children': canvasData };

    /* When all data has been loaded, toggle the nodes so that only the first two days of each week
    will be expanded (the other days are collapsed). This makes the canvas less crowded. */
    if (this.renderCount === this.apis.length) {
      root.children.forEach(collapse);
      toggle(root.children[0]);
      toggle(root.children[1]);
    }

    update(root, canvas);

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      }
    }

    /* The update function tells D3 how to render the new canvas any time new data is entered or 
    mouse events occur. */
    function update(root, canvas) {

      var duration = 500;
      // var duration = function(d) {
      //   if (d.rendered < component.apis.length) {
      //     d.rendered++;
      //     return 0;
      //   } else if (!d.rendered) {
      //     d.rendered = 1;
      //   }
      //   return 500;
      // }

      /* Nodes and links will be arranged in arrays for reference and when D3 needs to iterate through them
      to assign positions, attributes, etc. */
      var nodes = tree.nodes(root).reverse();
      var links = tree.links(nodes);

      /* Determine relative position of node's based on their depth in the tree.
      If an item is very old (YouTube may return a video from over a year ago that is the search term's most
      popular result) it will affix to the bottom of the canvas. */
      nodes.forEach(function(d) { 
        if (d.depth === 1) {
          if (d === oldestItem) {
            d.x = height - margin.bottom;
            d.y = 0;
            return;
          }
          d.x = y(new Date(d.date));
          d.y = 0;
          d.fixed = true;
        }
        else {
          if (d.depth === 2) {
            d.y = 120 * (component.state.width > 1350 ? 1 : (component.state.width / 1350));
          };
          if (d.depth === 3) {
            d.y = 240 * (component.state.width > 1350 ? 1 : (component.state.width / 1350));
            }
          }
        });

      //Update nodes.
      var node = svg.selectAll('g.node')
          .data(nodes, function(d) { return d.id || (d.id = ++idCounter); });

      //Attribute mouse events to various nodes upon entering.
      var nodeEnter = node.enter().append('svg:g')
        .attr('class', 'node')
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .on('click', function(d) {
          if (d.url) { 
            window.open(d.url,'_blank');
            return;
          } else if (d.parent.source === 'youtube') {
            window.open('https://www.youtube.com/watch?v=' + d.videoId, '_blank');
            return;
          }
          toggle(d); 
          update(root, canvas); 
        })
        .on('mouseenter', function(d) {
          console.log(d);
          d3.select(this).select('circle')
            .style({
              stroke: 'blue',
              strokeWidth: 1.5 + 'px',
            })
          if (d.depth === 3) {
            component.mouseOver(d);
          }
        })
        .on('mouseover', function(d) {
          if (d.depth === 3) {
            d3.select(this).select('circle')
              .transition()
              .attr({
                r: 28,
              })
            }
        })
        .on('mouseout', function(d) {
          d3.select(this).select('circle')
            .style({
              stroke: 'steelblue',
              strokeWidth: 1.5 + 'px',
            })
          if (d.depth === 3) {
            d3.select(this).select('circle')
              .transition()
              .attr({
                r: 25,
              })
            }
        });

      /* Append defs & patterns to SVG in order to render various images based on source and URL.
      Each pattern's ID will be used during node entrance and updates. */
      var defs = svg.append('svg:defs');
        defs.append('svg:pattern')
          .attr('id', 'tile-twitter')
          .attr('width', '20')
          .attr('height', '20')
          .append('svg:image')
          .attr('xlink:href', 'https://g.twimg.com/Twitter_logo_blue.png')
          .attr('x', 4)
          .attr('y', 5)
          .attr('width', 15)
          .attr('height', 15)
        defs.append('svg:pattern')
          .attr('id', 'tile-nyt')
          .attr('width', '20')
          .attr('height', '20')
          .append('svg:image')
          .attr('xlink:href', 'http://www.hitthefloor.com/wp-content/uploads/2014/03/20-new-york-times-t-1.jpg')
          .attr('x', -7)
          .attr('y', -7)
          .attr('width', 40)
          .attr('height', 40)
        defs.append('svg:pattern')
          .attr('id', 'tile-youtube')
          .attr('width', '20')
          .attr('height', '20')
          .append('svg:image')
          .attr('xlink:href', 'https://lh5.ggpht.com/jZ8XCjpCQWWZ5GLhbjRAufsw3JXePHUJVfEvMH3D055ghq0dyiSP3YxfSc_czPhtCLSO=w300')
          .attr('x', 4)
          .attr('y', 5)
          .attr('width', 15)
          .attr('height', 15)
        defs.append('svg:pattern')
          .attr('id', 'tile-twitternews')
          .attr('width', '20')
          .attr('height', '20')
          .append('svg:image')
          .attr('xlink:href', 'https://pbs.twimg.com/profile_images/3756363930/c96b2ab95a4149493229210abaf1f1fa_400x400.png')
          .attr('x', -2)
          .attr('y', -1)
          .attr('width', 27)
          .attr('height', 27)

      /* Nodes will enter at a specified point on the canvas. When update is called on first render,
      the nodes will take shape with certain attributes, including radius, fills (usually with image if
      image url is available). */
      nodeEnter.append('svg:circle')
        .attr('r', 1e-6)
        .style('fill', function(d) { return d._children ? 'lightsteelblue' : '#fff'; })
        .style({
          cursor: 'pointer',
          fill: '#fff',
          stroke: 'steelblue',
          strokeWidth: '1.5px',
        });

      var nodeUpdate = node.transition()
          .duration(duration)
          .attr('transform', function(d) { 
            return 'translate(' + d.y + ',' + d.x + ')'; 
          });

      nodeUpdate.select('circle')
          .attr('r', function(d) {
            if (d.depth === 1 && d._children) {
              return Math.max(d._children.length * 6, 10);
            } else if (d.depth === 1 && d.children) {
              return 10;
            } else if (d.source) {
              return 12;
            } else if (d.depth === 3)
              return 25;
          })
          .style('fill', 'white')
          .style('fill', function(d) { 
            if (d.source == 'twitter') {
              return 'url(/#tile-twitter)';
            } else if (d.source === 'nyt') {
              return 'url(/#tile-nyt)';
            } else if (d.source === 'youtube') {
              return 'url(/#tile-youtube)';
            } else if (d.source === 'twitter news') {
              return 'url(/#tile-twitternews';
            } else if (d.img === '') {
              return colors(d.id);
            } else if (d.depth === 3) {
              defs.append('svg:pattern')
                .attr('id', 'tile-img' + d.id)
                .attr({
                  'width': '40',
                  'height': '40',
                })
                .append('svg:image')
                .attr('xlink:href', function() {
                  if (d.thumbnail) {
                    return d.thumbnail.medium.url;
                  } else if (d.img) {
                    return d.img;
                  }
                })
                .attr('x', 0)
                .attr('y', -2)
                .attr('width', 55)
                .attr('height', 55)
              return 'url(/#tile-img' + d.id + ')'
            }
            return d._children ? 'lightsteelblue' : '#fff'; 
          })

      /* When the node exits (when a node is clicked, for example) the node will shrink and retract
      to the position of its parent node. */
      var nodeExit = node.exit().transition()
          .duration(duration)
          .attr('transform', function(d) { return 'translate(' + d.parent.y + ',' + d.parent.x + ')'; })

      nodeExit.select('circle')
          .attr('r', 1e-6);

      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });


      /* Links have both a source and target based on node's ID's */
      var link = svg.selectAll('path.link')
          .data(tree.links(nodes), function(d) { return d.target.id; })

      link.enter().insert('svg:path', 'g')
          .attr('class', 'link')
          .attr('d', function(d) {
            var origin = { x: d.source.x0, y: d.source.y0 };
            return diagonal({ source: origin, target: origin });
          })
          .style({
            fill: 'none',
            strokeWidth: '1.5px',
          })
          //The links from the hidden root node to the nodes on the timeline will not show.
          .style('stroke', function(d) {
            if (d.target.depth === 1) { return 'white'; }
            else { return '#ccc'; };
          })

      link.transition()
          .duration(500)
          .attr('d', diagonal);

      /* On exit, links will retract to the position of their source node */
      link.exit().transition()
          .duration(500)
          .attr('d', function(d) {
            var origin = {x: d.source.x, y: d.source.y};
            return diagonal({source: origin, target: origin});
          })
          .remove();
    }
 
    if (canvas === 1 && canvasData[0] && canvasData[0].children[0]) {component.mouseOver(canvasData[0].children[0].children[0])}

    /* The toggle function hides a node's children from D3 so that the children are not rendered.
    This way, nodes can appear and exit when certain click events occur and the canvas re-renders. */
    function toggle(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    }
  },

});

module.exports = TreeTimeLine; 
