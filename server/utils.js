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

  'getSimpleDate': function(date) {
    var date = new Date(date);
    return {
      year: date.getFullYear().toString(),
      month: (((date.getMonth()+1).toString()[1]) ? date.getMonth()+1 : "0" + (date.getMonth()+1)).toString(),
      day: ((date.getDate().toString()[1]) ? date.getDate() : "0" + date.getDate()).toString()
    };
  }

};