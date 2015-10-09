var React = require('react');
var StyleSheet = require('react-style');

var TimeSpanSlider = require('./timespanslider.jsx');

var i = 0;

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '60px',
    paddingRight: '10px',
    textAlign: 'center',
  },
  title: {
    fontFamily: 'Nunito',
    fontSize: '24px',
    color: '#00BFFF',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    marginBottom: '5px',
    textAlign: 'left',
    paddingLeft: '10px',
  },
  subhead: {
    fontFamily: 'Nunito',
    fontSize: '14px',
    color: 'rgb(128, 128, 128)',
    marginTop: '1px',
    marginBottom: '5px',
    textAlign: 'left',
    paddingLeft: '10px',
  },
  d3: {
  }
});

var TreeTimeLine = React.createClass({

  getInitialState: function(){
    
  //Initial timespan set at one week
  return {
      timeSpan: 7,
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
    // 'news'
  ],

  //Rendering the timeline will start a query for a search term passed down from the results page.
  query: function(searchTerm){
    
    for(var i = 0; i < this.apis.length; i++){
      this.handleQuery({
        searchTerm: searchTerm.replace(/\s\(.*$/,''),
        url: 'http://127.0.0.1:3000/api/' + this.apis[i],
        api: this.apis[i]
      });
    }
  },

  breakPoint: null,

  componentDidMount: function(){
    var component = this;
    this.query(this.props.searchTerm);

    //When a user scrolls to the bottom of the document, a new timeline will be rendered that is 7 days longer.
    // $(window).scroll(function() {

    //   var scrollPoint = $(window).scrollTop() + $(window).height();
    //   if (scrollPoint >= $(document).height() - 20) {
    //        //An upper limit for the timeline's span is set at 30 days.
    //        if (component.dates.length > 27) {
    //         return;
    //        }
    //        component.breakPoint = scrollPoint;
    //        component.setTimeSpan(component.dates.length + 6);
    //    }

    //   if ($(window).scrollTop() + component.props.window.height < component.breakPoint) {
    //     if (component.dates.length < 8) {
    //       return;
    //     }
    //     component.breakPoint = component.breakPoint - component.props.window.height;
    //     component.setTimeSpan(component.dates.length - 8);
    //    }
    // });
  },

  componentWillReceiveProps: function(newProps){

    //If the new search term matches the term queried for the current results, nothing will change.
    if (this.props.searchTerm !== newProps.searchTerm) {
      this.query(newProps.searchTerm);
      this.setState({apiData: []});
    }

    this.setState({
      width: newProps.window.width,
      height: newProps.window.height,
    });
  },

  handleQuery: function(searchQuery){
    $.post(searchQuery.url, searchQuery)
     .done(function(response) {

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

  setTimeSpan: function(timeSpan) {
    this.setState({ height: timeSpan * 80 });
    this.setState({ timeSpan: timeSpan });
  },

  render: function() {

    var component = this;

    var generateDates = function(timeSpan) {
        component.dates = [];
        for (var i = -1; i < timeSpan; i++) {
        var date = new Date();
        date.setDate(date.getDate() - i);
        component.dates.push(date.toJSON().slice(0, 10));
      }
    }

    generateDates(this.state.timeSpan);

    this.renderCanvas();    // Crucial step that (re-)renders D3 canvas
    this.getDynamicStyles();

    return (
      <div id="d3container" style={styles.container}>
        <div id="d3title" style={styles.title}>immedia: recent events</div>
        <div id="d3subhead" style={styles.subhead}>hover over a bubble to preview</div>
        <div id="d3canvas"></div>
      </div>
    );
  },

  getDynamicStyles: function() {
    styles.container.left = (this.state.width - 1350 > 0 ? (this.state.width - 1350) / 2 : 0) + 'px';
    styles.container.width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 'px';
    styles.container.height = (this.state.height - 60) + 'px';
    // styles.container.height = this.dates.length * 80;
    styles.d3.height = this.state.height - 120 + 'px';
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
        tweetId: item.tweet_id_str,
        byline: (item.hasOwnProperty('byline') ? item.byline : ''),
        abstract: (item.hasOwnProperty('abstract') ? item.abstract : ''),
        height: (item.hasOwnProperty('height') ? item.height : ''),
        width: (item.hasOwnProperty('width') ? item.width : ''),
      });
  },

  renderCanvas: function() {

    var component = this;
    d3.select('svg').remove();

    var colors = d3.scale.category20c();

    var margin = {
      top: 10,
      right: 40,
      bottom: 20,
      left: 40
    };

    var width = (this.state.width - 1350 < 0 ? this.state.width * (350/1350) : 350),
        height = this.state.height - 130;
        // height = this.dates.length*80;


    var oldestItem = this.state.apiData[this.state.apiData.length - 1] ? 
                      this.state.apiData[this.state.apiData.length - 1] : null;

    var y = d3.time.scale()
      .domain([new Date(this.dates[this.dates.length - 1]), new Date(this.dates[0])])
      .rangeRound([height - 4*(margin.top) - margin.bottom, 0])

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(d3.time.days, 1)
      .tickFormat(d3.time.format('%a %d'))
      .tickSize(0)
      .tickPadding(10);

    var svg = d3.select('#d3canvas').append('svg')
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

    // var timeLine = svg.selectAll('.timeLine')
    //   .data({ 'name': 'data', 'children': this.state.apiData })
    //   .attr('y', function(d) { return y(new Date(d.date)); })

    svg.selectAll('g.node').remove();


    //-----draw tree from each tick on yAxis timeline ------

    var root;

    var tree = d3.layout.tree()
        .size([height, width])

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

      root = { 'name': 'data', 'children': this.state.apiData };
      root.x0 = height / 1.5;
      root.y0 = 0;

    function toggleAll(d) {
        if (d.children) {
          d.children.forEach(toggleAll);
          toggle(d);
        }
      }

      // Initialize the display to show a few nodes.
      // root.children.forEach(toggleAll);
      // toggle(root.children[0]);
      // toggle(root.children[1]);

      update(root);

    function update(source) {

      // var duration = 500;
      var duration = function(d) {
        if (d.rendered < component.apis.length) {
          d.rendered++;
          return 5;
        } else if (!d.rendered) {
          d.rendered = 1;
        }
        // component.mouseOver(d);
        return 500;
      }

      var nodes = tree.nodes(root).reverse();
      var links = d3.layout.tree().links(nodes);

      nodes.forEach(function(d) { 
        if (d.depth === 1) {
          if (d === oldestItem) {
            d.x = height - margin.bottom;
            d.y = 0;
            return;
          }
          d.x = y(new Date(d.date)) - 20;
          d.y = 0;
          // if (d.x > height) { 
          //   d.outOfRange = true; 
          // } else {
          //   d.outOfRange = false;
          // }
          d.fixed = true;
        }
        else {
          if (d.depth === 2) {
            //If Twitter has more than 3 tweets in a day, only one child node will appear on the canvas
            //When this node is moused over, a timeline of tweets from the day will appear in the preview window
            d.y = 120 * (component.state.width > 1350 ? 1 : (component.state.width / 1350));
          };
          if (d.depth === 3) {
            component.mouseOver(d);
            d.y = 240 * (component.state.width > 1350 ? 1 : (component.state.width / 1350));

            }
          }
        });

      // Update the nodes…
      var node = svg.selectAll('g.node')
          .data(nodes, function(d) { return d.id || (d.id = ++i); });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append('svg:g')
        .attr('class', 'node')
        .on('click', function(d) {
          console.log(d);
          if (d.url) { 
            window.open(d.url,'_blank');
            return;
          } else if (d.parent.source === 'youtube') {
            window.open('https://www.youtube.com/watch?v=' + d.id, '_blank');
            return;
          }
          toggle(d); 
          update(d); 
        })
        .on('mouseenter', function(d) {
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
          .attr('height', 15);

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
          // .ease('linear')
          .attr('transform', function(d) { 
            if (d == root) {
              d.y = -1000;
            }
            return 'translate(' + d.y + ',' + d.x + ')'; 
          });

      nodeUpdate.select('circle')
          .attr('r', function(d) {
            if (d.depth === 1 && d._children) {
              return 12;
            } else if (d.depth === 1 && d.children) {
              return Math.max(d.children.length * 6, 9);
            } else if (d.source) {
              return 12;
            } else if (d.depth === 3)
              return 25;
          })
          .style('fill', 'white')
          .style('fill', function(d) { 
            var dat = d;
            if (d.source == 'twitter') {
              return 'url(/#tile-twitter)';
            } else if (d.source == 'nyt') {
              return 'url(/#tile-nyt)';
            } else if (d.source == 'youtube') {
              return 'url(/#tile-youtube)';
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
          .attr('transform', function(d) { return 'translate(' + source.y + ',' + source.x + ')'; })
          .remove();

      nodeExit.select('circle')
          .attr('r', 1e-6);


      var link = svg.selectAll('path.link')
          .data(tree.links(nodes), function(d) { return d.target.id; })

      link.enter().insert('svg:path', 'g')
          .attr('class', 'link')
          .attr('d', function(d) {
            var origin = { x: source.x0, y: source.y0 };
            return diagonal({ source: origin, target: origin });
          })
          .style({
            fill: 'none',
            stroke: '#ccc',
            strokeWidth: '1.5px',
          })
        .transition()
          .duration(500)
          .attr('d', diagonal)


      link.transition()
          .duration(500)
          .attr('d', diagonal);

      link.exit().transition()
          .duration(500)
          .attr('d', function(d) {
            var origin = {x: source.x, y: source.y};
            return diagonal({source: origin, target: origin});
          })
          .remove();

      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    function toggle(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(root);
    }
  },

});

module.exports = TreeTimeLine; 