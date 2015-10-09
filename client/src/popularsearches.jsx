var React = require('react');

var PopularSearches = React.createClass({

  getInitialState: function() {
    return {
      popularSearches: '',
    }
  },


  componentDidMount: function() {
    var component = this;
    $.get('http://127.0.0.1:3000/searches/popularSearches/', function(data, status) {
      console.log('popular searches:', data);
      component.setState({
        popularSearches: data,
      })
    });
  },

  renderCanvas: function() {
    var component = this;
    var colors = d3.scale.category20c();

    d3.select('svg').remove();

    var width = 1200;
    var height = 800;

    var svg = d3.select('#d3searchContainer').append('svg')
      .attr({
        width: width,
        height: height,
      })
      .append('g')

    var force = d3.layout.force()
      .on("tick", tick)
      .gravity(0)
      .linkDistance(150)

    function tick() {
      link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    };

    var root = {
      name: 'Popular Searches',
      children: [],
    }

    for (var term in component.state.popularSearches) {
      root.children.push({
        term: term,
        rank: component.state.popularSearches[term].rank,
        img: component.state.popularSearches[term].img
      })
    };

    root.fixed = true;
    root.x = width / 2;
    root.y = height / 4;
    update(root, force);

    function update(source, force) {

      function flatten(root) {
        var nodes = [], i = 0;

        function recurse(node) {
          if (node.children) node.size = node.children.reduce(function(p, v) { return p + recurse(v); }, 0);
          if (!node.id) node.id = ++i;
          nodes.push(node);
          return node.size;
        }

        root.size = recurse(root);
        return nodes;
        };

      var nodes = flatten(root);
      var links = d3.layout.tree().links(nodes);
      
      // function findNodes(source) {

      //   var nodes = [];
      //   var idCounter = 0;

      //   function recurse(node) {
      //     node.id = idCounter++;
      //     nodes.push(node);
      //     if (node.children) {
      //       for (var i = 0; i < node.children.length; i++) {
      //         recurse(node.children[i]);
      //       }
      //     }
      //     recurse(source);
      //     return nodes;
      //   }
      // };

      force.nodes(nodes);
      force.links(links);
      force.start();

      link = svg.selectAll("line.link")
          .data(links, function(d) { return d.target.id; })

      link.enter().insert("svg:line", ".node")
          .attr("class", "link")
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; })
          .style({
            fill: 'none',
            stroke: '#ccc',
            strokeWidth: '1.5px',
          })

      link.exit().remove();

      node = svg.selectAll("circle.node")
          .data(nodes, function(d) { return d.id; })
          .style('fill', function(d) {
            return colors(d.id);
          })

      var defs = svg.append('svg:defs');

      node.transition()
          .attr("r", function(d) {
            return 100/(d.rank);
          })

      node.enter().append("svg:circle")
          .attr("class", "node")
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; })
          .attr("r", function(d) {
            if (d == root) { return 10; }
            return 40 - 2*(d.rank);
            // if (d.rank) { return 25; }
          })
          .style({
            cursor: 'pointer',
            fill: '#fff',
            stroke: 'steelblue',
            strokeWidth: '1.5px',
          })
          .style('fill', function(d) {
            if (d == root) { return 'lightsteelblue'; }
            if (d.img) {
              defs.append('svg:pattern')
                .attr('id', 'tile-img' + d.id)
                .attr({
                  'width': '40',
                  'height': '40',
                })
                .append('svg:image')
                .attr('xlink:href', function() {
                  return d.img;
                })
                .attr('x', 2)
                .attr('y', 3)
                .attr('width', 70)
                .attr('height', 70)
              return 'url(/#tile-img' + d.id + ')'
            }
          })
          .on('click', function(d) {
            console.log(d);
          })
          .call(force.drag)

      node.exit().remove();
    }
  },
  
  render: function() {
    
    this.renderCanvas();

    return (
      <div id='d3searchContainer'></div>
      )
  }

});

module.exports = PopularSearches;