var Dates = require('./dates.js');
var Query = require('./query.js');

module.exports = {

	idCounter: 0,

	renderCount: 0,

	/* The toggle function hides a node's children from D3 so that the children are not rendered.
	This way, nodes can appear and exit when certain click events occur and the canvas re-renders. */
	toggle: function(d) {
	  if (d.children) {
	    d._children = d.children;
	    d.children = null;
	  } else {
	    d.children = d._children;
	    d._children = null;
	  }
	},

	mouseOver: function(item, callback) {
	  if (this.mousedOver === item) {
	    return;
	  } else {
	    this.mousedOver = item;
	  }

	  item.hasOwnProperty('tweet_id_str') ? item.tweet_id = item.tweet_id_str : '';

	  callback({
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

	processCanvasData: function(data, canvas) {

		/* Because each canvas represents one week in time, only data dated within that week's time period
		will be included and rendered on the canvas */
		var canvasData = [];
		for (var i = 0; i < data.length; i++) {
		  // if (i === startDay - 1) { continue; }
		  if (Dates.dates[canvas].indexOf(data[i].date) !== -1) {
		    canvasData.push(data[i]);
		  }
		};

		return canvasData;

	},

}