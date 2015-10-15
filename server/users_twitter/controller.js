var User = require('./model.js');

module.exports = {
  insertUser: function(userObj) {
    User.create(userObj, function(error, record) {
      if(error) console.error(error);
    });
  },

  findUser: function(search_term, callback) {
    User.find({'search_term': search_term}, function(error, data) {
      if(error) console.error(error);
      callback(data[0]);
    });
  }
}