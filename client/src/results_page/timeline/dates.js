module.exports = {

	dates: [],

	generateDates: function(canvasProps) {
	    this.dates[canvasProps.canvas] = [];
	    for (var i = canvasProps.startDay; i <= canvasProps.endDay; i++) {
	    var date = new Date();
	    date.setDate(date.getDate() - i);
	    this.dates[canvasProps.canvas].push(date.toJSON().slice(0, 10));
	  }
	},

}