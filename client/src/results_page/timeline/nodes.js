var helpers = require('./helpers.js');

var Images = require('./images.js');

module.exports = {

	describeNodes: function(canvasProps, nodeCallbacks) {

		var duration = 500;

		/* Determine relative position of node's based on their depth in the tree.
		If an item is very old (YouTube may return a video from over a year ago that is the search term's most
		popular result) it will affix to the bottom of the canvas. */
		canvasProps.nodes.forEach(function(d) { 
		  if (d.depth === 1) {
		    if (d === canvasProps.oldestItem) {
		      d.x = canvasProps.height - canvasProps.margin.bottom;
		      d.y = 0;
		      return;
		    }
		    d.x = canvasProps.yScale(new Date(d.date)) - 30;
		    d.y = 0;
		    d.fixed = true;
		  }
		  else {
		    if (d.depth === 2) {
		      d.y = 120 * (canvasProps.componentWidth > 1350 ? 1 : (canvasProps.componentWidth / 1350));
		    };
		    if (d.depth === 3) {
		      d.y = 240 * (canvasProps.componentWidth > 1350 ? 1 : (canvasProps.componentWidth / 1350));
		      }
		    }
		  });

		//Update nodes.
		var node = canvasProps.svg.selectAll('g.node')
		    .data(canvasProps.nodes, function(d) { return d.id || (d.id = ++helpers.idCounter); });

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
		    helpers.toggle(d); 
		    nodeCallbacks.update(canvasProps); 
		  })
		  .on('mouseenter', function(d) {
		    console.log(d);
		    d3.select(this).select('circle')
		      .style({
		        stroke: 'blue',
		        strokeWidth: 1.5 + 'px',
		      })
		    if (d.depth === 3) {
		      helpers.mouseOver(d, nodeCallbacks.mouseOver);
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
		      return Images.describeNodeImages(d, canvasProps.defs);
		    })

		/* When the node exits (when a node is clicked, for example) the node will shrink and retract
		to the position of its parent node. */
		var nodeExit = node.exit().transition()
		    .duration(duration)
		    .attr('transform', function(d) { return 'translate(' + d.parent.y + ',' + d.parent.x + ')'; })

		nodeExit.select('circle')
		    .attr('r', 1e-6);

		canvasProps.nodes.forEach(function(d) {
		  d.x0 = d.x;
		  d.y0 = d.y;
		});

	},

};