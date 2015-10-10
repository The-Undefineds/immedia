var blackListedWords = require('../assets/assets.js').blackListedWords;

var months = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12'
};

var parseQueryString = function(queryString){
  queryString = queryString.split(' ');
  var newQueryString = [];
  queryString.forEach(function(item){
    if (!(blackListedWords[item])) newQueryString.push(item); 
  })
  newQueryString = newQueryString.join(' ');
  return newQueryString;
}

var parseText = function(tweet){
  //Removed ending text that consists of links
  var index = tweet.indexOf('http');
  if (index !== -1) tweet = tweet.slice(0, index);
  
  var fixedTweet = tweet.replace(/\W/g, " ")
  
  var newTweet = [],
      topic = [],
      obj = {},
      i;

  fixedTweet = fixedTweet.split(' ');
  
  for (i = 0; i < fixedTweet.length; i++){
    if (fixedTweet[i] === '' || fixedTweet[i].length === 1) continue;
    var changed = false;
    var indexes = [];
    var McCarthy = fixedTweet[i].indexOf('Mc');
    var MacCarthy = fixedTweet[i].indexOf('Mac');
    
    for (var z = 1; z < fixedTweet[i].length; z++){
      console.log(fixedTweet[i]);
      if (fixedTweet[i][z].match(/\d/g)) continue;
      if (fixedTweet[i][z] === fixedTweet[i][z].toUpperCase()){
        indexes.push(z);
        changed = true;
      }
      if (McCarthy === z) z += 2;
      if (MacCarthy === z) z += 3;
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
    if (blackListedWords[newTweet[i]]) continue;
    
      if (!(obj[newTweet[i]])){
        topic.push(newTweet[i]);
        obj[newTweet[i]] = true;
      }
    
    if (i + 1 !== newTweet.length) {
      if (blackListedWords[newTweet[i + 1]]) continue;
      if (!(obj[newTweet[i] + ' ' + newTweet[i + 1]])){
        topic.push(newTweet[i] + ' ' + newTweet[i + 1]);
        obj[newTweet[i] + ' ' + newTweet[i + 1]] = true;
      }
    }
  }
  
  return topic;
};

var getDate = function(date){
  date = date.split(' ');
  var returnDate = '';
  returnDate += date[2] + '-';
  returnDate += months[date[0]] + '-';
  returnDate += date[1];
  
  return returnDate;
}

module.exports = {
  parseText: parseText,
  getDate : getDate,
  parseQueryString : parseQueryString
};