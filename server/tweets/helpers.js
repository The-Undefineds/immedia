var months = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12
};


var extractUrl = function(tweet){
  for (var i = tweet.length-1; i >= 0; i--) {
    if (tweet[i] === 'h' && tweet.slice(i, i+5) === 'http:') {
      return tweet.slice(i);
    }
  }
};

var convertDateToInteger = function(date){
  var month = months[date.slice(0, 3)],
      day   = Number(date.slice(4, 6)),
      year  = Number(date.slice(7));
  return year * 480 + month * 40 + day * 1;
};

// var parse ....


module.exports = {
  extractUrl: extractUrl,
  convertDateToInteger: convertDateToInteger
};