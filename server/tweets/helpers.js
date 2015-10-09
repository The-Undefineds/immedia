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

var parseText = function(tweet){
  //character.toUpperCase()
  
  //Removed ending text that consists of links
  var index = tweet.indexOf('http');
  if (index !== -1) tweet = tweet.slice(0, index);
  
  var fixedTweet = tweet.replace(/([.,'"*+?^=!:${}()@#’|\-\[\]\/\\])/g, " ")
  
  var newTweet = [],
      topic = [],
      obj = {},
      i;

  fixedTweet = fixedTweet.split(' ');
  
  for (i = 0; i < fixedTweet.length; i++){
    if (fixedTweet[i] === '') continue;
    var changed = false;
    var indexes = [];
    
    for (var z = 1; z < fixedTweet[i].length; z++){
      if (fixedTweet[i][z] === fixedTweet[i][z].toUpperCase()){
        indexes.push(z);
        changed = true;
      }
    }
    
    if (!changed) newTweet.push(fixedTweet[i].toLowerCase());
    else {
      newTweet.push(fixedTweet[i].slice(0, indexes[0]).toLowerCase());
      for (z = 0; z < indexes.length; z++){
        if (z + 1 === indexes.length){
          newTweet.push(fixedTweet[i].slice(indexes[z]).toLowerCase());
          continue;
        }
        newTweet.push(fixedTweet[i].slice(indexes[z], indexes[z + 1]).toLowerCase());
      }
    }
  }

  for (i = 0; i < newTweet.length; i++){
    if (assets.blackListedWords[newTweet[i]]) continue;
    
    if (!(obj[newTweet[i]])){
      topic.push(newTweet[i]);
      obj[newTweet[i]] = true;
    }
    
    if (i + 1 !== newTweet.length) {
      if (assets.blackListedWords[newTweet[i + 1]]) continue;
      if (!(obj[newTweet[i] + ' ' + newTweet[i + 1]])){
        topic.push(newTweet[i] + ' ' + newTweet[i + 1]);
        obj[newTweet[i] + ' ' + newTweet[i + 1]] = true;
      }
    }
  }
  
  return topic;
};

module.exports = {
  extractUrl: extractUrl,
  convertDateToInteger: convertDateToInteger,
  parseText: parseText
};