module.exports = {

	describeDefs: function(canvasProps) {

		/* Append defs & patterns to SVG in order to render various images based on source and URL.
		Each pattern's ID will be used during node entrance and updates. */
		var defs = canvasProps.svg.append('svg:defs');
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

		return defs;
	},

}