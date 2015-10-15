var React = require('react');
var StyleSheet = require('react-style');

var idCounter = 0;

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50px',
    paddingRight: '10px',
    textAlign: 'center',
    overflow: 'scroll',
  },
  title: {
    position: 'fixed',
    fontFamily: 'Nunito',
    fontSize: '24px',
    color: '#00BFFF',
    backgroundColor: 'rgba(232, 232, 232, 1)',
    marginTop: '10px',
    marginBottom: '5px',
    textAlign: 'left',
    paddingLeft: '10px',
  },
  subhead: {
    position: 'fixed',
    fontFamily: 'Nunito',
    fontSize: '14px',
    color: 'rgb(128, 128, 128)',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    marginTop: '42px',
    marginBottom: '5px',
    textAlign: 'left',
    paddingLeft: '10px',
  },
  d3: {
    zIndex: -1,
    marginTop: '60px',
  },
  block: {
    position: 'fixed',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    height: '50px',
    marginBottom: '5px',
    paddingLeft: '10px',
    textAlign: 'left',
  }
});

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
        url: 'http://127.0.0.1:3000/api/' + this.apis[i],
        days: 30,
        api: this.apis[i]
      });
    }
  },

  breakPoint: null,

  componentDidMount: function(){
    this.query(this.props.searchTerm.toLowerCase());
  },

  componentWillReceiveProps: function(newProps){
    
    //If the new search term matches the term queried for the current results, nothing will change.
    this.renderCount = 0;
    if (this.props.searchTerm !== newProps.searchTerm) {
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

    this.renderCanvas(0, 6, 1);    // Crucial step that (re-)renders D3 canvas
    this.renderCanvas(7, 13, 2);
    this.renderCanvas(14, 20, 3);
    this.renderCanvas(21, 28, 4);

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
    // styles.d3.height = this.state.height - 110 + 'px';
    styles.d3.width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 20 + 'px';
    return;
  },

  mouseOver: function(item) {
    if (this.mousedOver === item) {
      return;
    } else {
      this.mousedOver = item;
    }
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

    d3.select('#d3canvas' + canvas).selectAll('svg').remove();

    var colors = d3.scale.category20c();

    var margin = {
      top: 10,
      right: 40,
      bottom: 20,
      left: 40
    };

    var width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 20,
        height = this.state.height;

    var oldestItem = this.state.apiData[this.state.apiData.length - 1] ? 
                      this.state.apiData[this.state.apiData.length - 1] : null;

    var canvasData = [];
    for (var i = 0; i < this.state.apiData.length; i++) {
      if (i === startDay - 1) { continue; }
      if (this.dates[canvas].indexOf(this.state.apiData[i].date) !== -1) {
        canvasData.push(this.state.apiData[i]);
      }
    };

    var y = d3.time.scale()
      .domain([new Date(this.dates[canvas][this.dates[canvas].length - 1]), d3.time.day.offset(new Date(this.dates[canvas][0]), 1)])
      .rangeRound([height - margin.bottom, canvas === 1 ? 80 : 0])

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(d3.time.days, 1)
      .tickFormat(d3.time.format('%a %d'))
      .tickSize(0)
      .tickPadding(10);

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

    //-----draw tree from each tick on yAxis timeline ------

    var tree = d3.layout.tree()
        .size([height, width])

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; })


    var root = { 'name': 'data', 'children': canvasData };

    // Initialize the display to show a few nodes.
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

      var nodes = tree.nodes(root).reverse();
      var links = tree.links(nodes);

      nodes.forEach(function(d) { 
        if (d.depth === 1) {
          if (d === oldestItem) {
            d.x = height - margin.bottom;
            d.y = 0;
            return;
          }
          d.x = y(new Date(d.date)) - 20;
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

      // Update the nodes…
      var node = svg.selectAll('g.node')
          .data(nodes, function(d) { return d.id || (d.id = ++idCounter); });

      // Enter any new nodes at the parent's previous position.
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
                .attr('y', 0)
                .attr('width', 55)
                .attr('height', 55)
              return 'url(/#tile-img' + d.id + ')'
            }
            return d._children ? 'lightsteelblue' : '#fff'; 
          })

      var nodeExit = node.exit().transition()
          .duration(duration)
          .attr('transform', function(d) { return 'translate(' + d.parent.y + ',' + d.parent.x + ')'; })

      nodeExit.select('circle')
          .attr('r', 1e-6);

      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });

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

      link.exit().transition()
          .duration(500)
          .attr('d', function(d) {
            var origin = {x: d.source.x, y: d.source.y};
            return diagonal({source: origin, target: origin});
          })
          .remove();

      if (canvas === 1 && canvasData[0] && canvasData[0].children[0]) {component.mouseOver(canvasData[0].children[0].children[0])}
    }

    function toggle(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      // update(root, canvas);
    }
  },

});

module.exports = TreeTimeLine; 
