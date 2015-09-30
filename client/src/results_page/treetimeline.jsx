var React = require('react');


var data = {
        name: 'data',
        children: [
              {
            date: '2015-09-28',
            children: [
              {
                source: 'NYT',
                children: [      
                {
                  title: 'Elon Musk',
                }, {
                  title: 'Larry Page',
                }
                ]
              },
              {
                source: 'Twitter',
                children: [
                {
                  title: 'Chuck Norris',
                }, {
                  title: 'The Rock',
                }
                ],
              }
              ],
            },
              {
            date: '2015-09-27',
            children: [],
          },
              {
            date: '2015-09-26',
            children: [],
          },
              {
            date: '2015-09-25',
            children: [
              {
                source: 'NYT',
                children: [      
                {
                  title: 'Donald Trump',
                  img: 'http://www.liberationnews.org/wp-content/uploads/2015/07/donaldtrump61815.jpg'
                }, {
                  title: 'Sarah Palin',
                  img: 'http://bluegrasspolitics.bloginky.com/files//2010/09/sarah-palin.jpg'
                }, {
                  title: 'Ted Nugent',
                  img: 'http://www.burntorangereport.com/wp-content/uploads/2014/11/ted-cruz-smarmy.jpg'
                }
                ]
              },
              {
                source: 'Twitter',
                children: [
                {
                  title: 'Kardashian 1',
                }, {
                  title: 'Kardashian 2',
                }
                ]
              }
                ]
          },
              {
            date: '2015-09-24',
            children: [],
          },
              {
            date: '2015-09-23',
            children: [],
          },
        ]
      }

var dateToday = new Date().toJSON().slice(0,10);
var d = new Date();
d.setDate(d.getDate() - 7);
dateWeekAgo = d.toJSON().slice(0, 10);

var d3data = {
  name: 'd3data',
  children: [
  {
    date: '2015-09-29',
    children: []
  }, {
    date: '2015-09-28',
    children: []
  }, {
    date: '2015-09-27',
    children: []
  }, {
    date: '2015-09-26',
    children: []
  }, {
    date: '2015-09-25',
    children: []
  }, {
    date: '2015-09-24',
    children: []
  }, {
    date: '2015-09-23',
    children: []
  }
  ]
}

var TreeTimeLine = React.createClass({

  render: function() {
    return (
      <div id="d3container"></div>
    )
  },

  renderCanvas: function() {
    var margin = {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40
    };
    var width = 800,
        height = 800;

    var y = d3.time.scale()
      .domain([new Date(dateWeekAgo), new Date(dateToday)])
      .rangeRound([height - margin.top - margin.bottom, 0])

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(d3.time.days, 1)
      .tickFormat(d3.time.format('%a %d'))
      .tickSize(20)
      .tickPadding(5)

    var svg = d3.select('#d3container').append('svg')
      .attr('class', 'timeLine')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(60, ' + margin.top + ')')

    svg.append('g')
      .attr('class', 'yAxis')
      .attr({
        'font-family': 'Arial, sans-serif',
        'font-size': '10px',
      })
      .attr({
        fill: 'none',
        stroke: '#000',
        'shape-rendering': 'crispEdges',
      })
      .call(yAxis);

    // var timeLine = svg.selectAll('.timeLine')
    //   .data(this.state.data)
    //   .attr('y', function(d) { return y(new Date(d.date)); })


    //-----draw tree from each tick on yAxis timeline ------
    var i = 0;
    var root;

    var tree = d3.layout.tree()
        .size([height, width])

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

      root = d3data;
      root.x0 = height / 1.5;
      root.y0 = 0;

    function toggleAll(d) {
        if (d.children) {
          d.children.forEach(toggleAll);
          toggle(d);
        }
      }

      // Initialize the display to show a few nodes.
      root.children.forEach(toggleAll);
      toggle(root.children[0]);

      update(root);

    function update(source) {
      var duration = 500;

      var nodes = tree.nodes(root).reverse();
      var links = d3.layout.tree().links(nodes);

      nodes.forEach(function(d) { 
        if (d.depth === 1) {
          d.x = y(new Date(d.date)) - 35;
          d.y = 0;
          d.fixed = true;
        }
        else {
          d.y = d.depth * 120; 
          }
        });

      // Update the nodes…
      var node = svg.selectAll("g.node")
          .data(nodes, function(d) { return d.id || (d.id = ++i); });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("svg:g")
        .attr("class", "node")
        .on("click", function(d) {
          toggle(d); 
          update(d); 
        })
        // .on("mouseover", function(d) {
        //   nodeEnter.append("svg:title")
        //     .text(function(d) { return d.title; })
        //     .style("fill-opacity", 1)
        // })
        // .on("mouseout", function(d) {
        //     nodeEnter.select('text')
        //       .style('fill-opacity', 0);
        // })

      var defs = svg.append('svg:defs');
        defs.append('svg:pattern')
          .attr('id', 'tile-twit')
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
          .attr('xlink:href', 'http://www.underconsideration.com/brandnew/archives/youtube_logo_detail.png')
          .attr('x', 4)
          .attr('y', 5)
          .attr('width', 15)
          .attr('height', 15)

      nodeEnter.append("svg:circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; })
        .style({
          cursor: 'pointer',
          fill: '#fff',
          stroke: 'steelblue',
          strokeWidth: '1.5px',
        })

      var nodeUpdate = node.transition()
          .duration(duration)
          .attr("transform", function(d) { 
            if (d == root) {
              d.y = -1000;
            }
            return "translate(" + d.y + "," + d.x + ")"; 
          });

      nodeUpdate.select("circle")
          .attr("r", function(d) {
            if (d._children && d !== root) {
              return d._children.length * 6;
            } else if (d.title) {
              return 20;
            }
            return 10;
          })
          .style("fill", function(d) { 
            var dat = d;
            if (d.source == 'twitter') {
              return 'url(/#tile-twit)';
            } else if (d.source == 'nyt') {
              return 'url(/#tile-nyt)';
            } else if (d.source == 'youtube') {
              return 'url(/#tile-youtube)';
            } else if (d.img) {
              defs.append('svg:pattern')
                .attr('id', 'tile-img' + d.id)
                .attr('width', '20')
                .attr('height', '20')
                .append('svg:image')
                .attr('xlink:href', d.img)
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 40)
                .attr('height', 40)
              return 'url(/#tile-img' + d.id + ')'
            }
            return d._children ? "lightsteelblue" : "#fff"; 
          });

      var nodeExit = node.exit().transition()
          .duration(duration)
          .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
          .remove();

      nodeExit.select("circle")
          .attr("r", 1e-6);

      var link = svg.selectAll("path.link")
          .data(tree.links(nodes), function(d) { return d.target.id; })

      link.enter().insert("svg:path", "g")
          .attr("class", "link")
          .attr("d", function(d) {
            var origin = { x: source.x0, y: source.y0 };
            return diagonal({ source: origin, target: origin });
          })
          .style({
            fill: 'none',
            stroke: '#ccc',
            strokeWidth: '1.5px',
          })
        .transition()
          .duration(duration)
          .attr("d", diagonal)

      link.transition()
          .duration(duration)
          .attr("d", diagonal);

      link.exit().transition()
          .duration(duration)
          .attr("d", function(d) {
            var o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
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

  processData: function(data) {
    for (var source in data) {
      for (var date in data[source]) {
        var daysAgo = Number(moment(data).fromNow().slice(1,2));
        d3data.children[daysAgo].children.push(data[source][date])
      }
    }
    console.log(d3data);
  },

  componentDidMount: function() {
    this.processData(this.props.data);
    this.renderCanvas();
  }

});

module.exports = TreeTimeLine; 