var months = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11
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

module.exports = {
  extractUrl: extractUrl,
  convertDateToInteger: convertDateToInteger
};