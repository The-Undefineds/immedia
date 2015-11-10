module.exports = {

	idCounter: 0,

	renderCount: 0,

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

}