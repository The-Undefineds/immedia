var mongoose  = require('mongoose');

var UserSchema = new mongoose.Schema({
  search_term: {type: String, unique: true},
  user_id: String,
  img: String
});

module.exports = mongoose.model('users', UserSchema);