module.exports = {

	dates: [],

	generateDates: function(startTime, endTime, canvas) {
	    this.dates[canvas] = [];
	    for (var i = startTime; i <= endTime; i++) {
	    var date = new Date();
	    date.setDate(date.getDate() - i);
	    this.dates[canvas].push(date.toJSON().slice(0, 10));
	  }
	},

}