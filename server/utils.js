module.exports = {

  'getDateFromToday': function(days, delimiter) {
    delimiter = delimiter || '';
    var today = new Date();
    var desiredDate = new Date(today.setDate(today.getDate() + days));
    var year = desiredDate.getFullYear().toString();
    var month = (((desiredDate.getMonth()+1).toString()[1]) ? desiredDate.getMonth()+1 : "0" + (desiredDate.getMonth()+1)).toString();
    var day = ((desiredDate.getDate().toString()[1]) ? desiredDate.getDate() : "0" + desiredDate.getDate()).toString();

    return year + delimiter + month + delimiter + day;
  }

};