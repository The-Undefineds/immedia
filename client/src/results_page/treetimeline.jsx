var React = require('react');

var dates = [];
var generateDates = function(timeSpan) {
  for (var i = 0; i < timeSpan; i++) {
    var date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toJSON().slice(0, 10));
  }
}

generateDates(7);

var d3data = {
  name: 'd3data',
  children: [
    {
      date: dates[0],
      children: []
    }, {
      date: dates[1],
      children: []
    }, {
      date: dates[2],
      children: []
    }, {
      date: dates[3],
      children: []
    }, {
      date: dates[4],
      children: []
    }, {
      date: dates[5],
      children: []
    }, {
      date: dates[6],
      children: []
    }
  ]
};

var queryResults = {
    nyt: {
        '2015-09-29':{
          source: 'nyt',
          children: [
            {
              title: 'Elon Musk',
              url: 'www.tesla.com',
              img: 'https://lh5.googleusercontent.com/-89xTT1Ctbrk/AAAAAAAAAAI/AAAAAAAAAAA/5gt6hkVvJHY/s0-c-k-no-ns/photo.jpg'
            }, {
              title: 'Sergie Brin',
              url: 'www.google.com',
              img: 'http://www.technologytell.com/gadgets/files/2014/05/Sergey-Brin-should-have-stayed-away-from-Google-Plus.jpg'
            }
          ]
        },
        '2015-09-27':{
          source: 'nyt',
          children: [
            {
              title: 'Pope Francis',
              url: 'www.thepope.com',
              img: 'http://m.snopes.com/wp-content/uploads/2015/07/pope-francis.jpg'
            }, {
              title: 'Barack Obama',
              url: 'www.whitehouse.gov',
              img: 'https://pbs.twimg.com/profile_images/1645586305/photo.JPG'
            }
          ]
        }
      },
    youtube: {
        '2015-09-29': {
          source: 'youtube',
          children: [
          {
            title: 'Nickelback',
            url: 'www.reddit.com',
            img: 'http://www.blogcdn.com/www.joystiq.com/media/2008/11/nickelback.jpg'
          }, {
            title: 'Creed',
            url: 'www.youtube.com',
            img: 'http://www.ew.com/sites/default/files/i/daily/629//creed_l.jpg'
          }
        ]
      }
    },
    twitter: {
        '2015-09-29': {
          source: 'twitter',
          children: [
          {
            title: 'Donald Trump',
            url: 'www.trump.com',
            img: 'http://uziiw38pmyg1ai60732c4011.wpengine.netdna-cdn.com/wp-content/dropzone/2015/08/RTX1GZCO.jpg'
          }, {
            title: 'The Donald',
            img: 'http://www.liberationnews.org/wp-content/uploads/2015/07/donaldtrump61815.jpg'
          }
          ]
        },
        '2015-09-27': {
          source: 'twitter',
          children: [
          {
            title: 'Kim Kardashian',
            img: 'http://media2.popsugar-assets.com/files/2014/11/04/920/n/1922153/961af48ae3ec88c3_thumb_temp_cover_file23876211415134157.xxxlarge/i/Kim-Kardashian-Bleached-Brows.jpg'
          }, {
            title: 'Rihanna',
            img: 'http://i.huffpost.com/gen/2717304/images/o-RIHANNA-DIOR-facebook.jpg'
          }
          ]
        },
      },
    wikipedia: {},
  }

var TreeTimeLine = React.createClass({

  render: function() {
    return (
      <div id="d3container"><svg></svg></div>
    )
  },

  mouseOver: function(item) {
    this.props.mouseOver({
        title: item.title,
        date: item.date,
        url: item.url,
        img: item.img,
      });
  },

  renderCanvas: function() {
    var component = this;

    var margin = {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40
    };
    var width = 600,
        height = 800;

    var y = d3.time.scale()
      .domain([new Date(dates[dates.length - 1]), new Date('2015-09-30')])
      .rangeRound([height - margin.top - margin.bottom, 0])

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(d3.time.days, 1)
      .tickFormat(d3.time.format('%a %d'))
      .tickSize(20)
      .tickPadding(5)

    var svg = d3.select('svg')
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

    var timeLine = svg.selectAll('.timeLine')
      .data(d3data)
      .attr('y', function(d) { return y(new Date(d.date)); })

    svg.selectAll('g.node').remove();


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
      // root.children.forEach(toggleAll);
      // toggle(root.children[0]);

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
          d.y = d.depth * 80; 
          }
        });

      // Update the nodes…
      var node = svg.selectAll("g.node")
          .data(nodes, function(d) { return d.id || (d.id = ++i); });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("svg:g")
        .attr("class", "node")
        .on("click", function(d) {
          console.log(d);
          toggle(d); 
          update(d); 
        })
        .on("mouseenter", function(d) {
          if (d.title) {
            component.mouseOver(d);
          }
          nodeEnter.append("svg:text")
            .text(function(d) { return d.title; })
            .attr({
              'dx': 20,
              'dy': -10,
            })
            .style("fill-opacity", 1)
        })
        .on("mouseout", function(d) {
            nodeEnter.selectAll('text')
              .remove()
        })

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
          .attr('xlink:href', 'https://lh5.ggpht.com/jZ8XCjpCQWWZ5GLhbjRAufsw3JXePHUJVfEvMH3D055ghq0dyiSP3YxfSc_czPhtCLSO=w300')
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
    //to-do: only process new data
    //refactor data structure
    for (var source in data) {
      for (var date in data[source]) {
        var daysAgo = moment(date).fromNow().slice(0,1);
        if (daysAgo === 'a') {
          daysAgo = 1;
        } else {
          daysAgo = Number(daysAgo);
        }
        if (d3data.children[daysAgo]) {
          d3data.children[daysAgo].children.push(data[source][date]);
        }
      }
    }
  },

  componentWillReceiveProps: function() {
    this.processData(this.props.data);
    this.renderCanvas();
  }

});

module.exports = TreeTimeLine; 