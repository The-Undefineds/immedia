/*
    file: utils.js
    - - - - - - - - - - - - 
    Various date helper functions that handle
    the different permutations of dates
    required for dealing with the APIs immedia uses.
 */

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

module.exports = {

  'getDateFromToday': function(days, delimiter) {
    delimiter = delimiter || '';
    var today = new Date();
    var desiredDate = new Date(today.setDate(today.getDate() + days));
    var simpleDesiredDate = this.getSimpleDate(desiredDate);

    return simpleDesiredDate.year + delimiter + simpleDesiredDate.month + delimiter + simpleDesiredDate.day;
  },

  'correctDateInFuture': function(date, delimiter) {
    var correctedDate = new Date(date);
    var today = new Date();
    correctedDate = correctedDate > today ? today : correctedDate;
    var simpleCorrectedDate = this.getSimpleDate(correctedDate);

    return simpleCorrectedDate.year + delimiter + simpleCorrectedDate.month + delimiter + simpleCorrectedDate.day;
  },

  'getDateTodayAndYesterday': function(delimiter){
    delimiter = delimiter || '';
    var today = new Date();
    var yesterday = new Date(today);
    yesterday = yesterday.setDate(today.getDate() - 1);
    
    today = this.getSimpleDate(today);
    yesterday = this.getSimpleDate(yesterday);

    return {
      today: today.year + delimiter + today.month + delimiter + today.day,
      yesterday: yesterday.year + delimiter + today.month + delimiter + today,
    }
  },

  'getSimpleDate': function(date) {
    var date = new Date(date);
    return {
      year: date.getFullYear().toString(),
      month: (((date.getMonth()+1).toString()[1]) ? date.getMonth()+1 : "0" + (date.getMonth()+1)).toString(),
      day: ((date.getDate().toString()[1]) ? date.getDate() : "0" + date.getDate()).toString()
    };
  },

  'extractUrl': function(tweet) {
    for (var i = tweet.length-1; i >= 0; i--) {
      if (tweet[i] === 'h' && tweet.slice(i, i+5) === 'http:') {
        return tweet.slice(i);
      }
    }
  },

 'convertDateToInteger': function(date) {
    var month = months[date.slice(0, 3)],
        day   = Number(date.slice(4, 6)),
        year  = Number(date.slice(7));

    return year * 480 + month * 40 + day * 1;
  }
};