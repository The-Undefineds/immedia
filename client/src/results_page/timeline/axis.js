var Dates = require('./dates.js');

module.exports = {

	yScale: function(canvasProps) {
		return d3.time.scale()
	      .domain([new Date(Dates.dates[canvasProps.canvas][Dates.dates[canvasProps.canvas].length - 1]), new Date(Dates.dates[canvasProps.canvas][0])]).nice()
	      .rangeRound([canvasProps.height - canvasProps.margin.bottom, canvasProps.canvas === 1 ? 80 : 40]);
	},

	describeYAxis: function(canvasProps) {
		
		var yAxis = d3.svg.axis()
	      .scale(canvasProps.yScale)
	      .orient('left')
	      .ticks(d3.time.days, 1)
	      .tickFormat(d3.time.format('%a %d'))
	      .tickSize(10)
	      .tickPadding(10);

	    canvasProps.svg.append('g')
	      .attr('class', 'yAxis')
	      .attr({
	        'font-family': 'Nunito',
	        'font-size': 10 * (canvasProps.componentWidth / 1350) + 'px',
	      })
	      .attr({
	        fill: 'none',
	        stroke: '#000',
	        'shape-rendering': 'crispEdges',
	      })
	      .call(yAxis);
	},

}