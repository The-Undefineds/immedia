var mongoose  = require('mongoose');

var UserSchema = new mongoose.Schema({
  screen_name: {
    type: String,
    required: true,
    unique: true
  },
  profile_image: String,
  background_image: String
});

module.exports = mongoose.model('users', UserSchema);