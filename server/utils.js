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
  }

};